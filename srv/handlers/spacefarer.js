import cds from "@sap/cds";
import { ROLE, FIELD_CONTROL } from "../CC.js";

export function getAssignedPlanet(req) {
  const planets = [req.user.attr.planet].flat();
  const [planet] = planets;
  const isValid =
    planets.length === 1 && typeof planet === "string" && planet.trim();
  return isValid ? planet : null;
}

export function beforeSpacefarerWrite(req) {
  if (req.user.is(ROLE.ADMIN) || !req.user.is(ROLE.OFFICER)) return;

  const planet = getAssignedPlanet(req);
  if (!planet) {
    return req.reject(
      403,
      "A single current planet must be assigned to your user.",
    );
  }

  if (req.event === "NEW" || req.event === "CREATE") {
    req.data.originPlanet = planet;
    return;
  }

  const isChangingPlanet =
    Object.hasOwn(req.data, "originPlanet") && req.data.originPlanet !== planet;
  if (isChangingPlanet) {
    return req.reject(
      403,
      "Only admins can change the planet.",
      "originPlanet",
    );
  }
}

export function afterSpacefarerRefresh(data, req) {
  const isAdmin = req.user.is(ROLE.ADMIN);
  const isOfficer = req.user.is(ROLE.OFFICER);
  const planet = getAssignedPlanet(req);

  for (const row of [data].flat().filter(Boolean)) {
    row.planetFieldControl = isAdmin
      ? FIELD_CONTROL.MANDATORY
      : FIELD_CONTROL.READ_ONLY;
    row.canIssueWarpLicense =
      isAdmin || (isOfficer && row.originPlanet === planet);
  }
}

export async function beforeSpacefarerDraftPatch(
  req,
  { Spacefarers, WarpLicenses, emailFormat },
) {
  await protectLicenseComposition(req, WarpLicenses);
  validateMandatoryFields(req, Spacefarers);
  await validateEmail(req, Spacefarers, emailFormat);
}

async function protectLicenseComposition(req, WarpLicenses) {
  if (!Object.hasOwn(req.data, "warpLicenses")) return;

  const spacefarerID = req.data.ID ?? req.params?.[0]?.ID;
  const existing = await cds
    .tx(req)
    .run(
      SELECT.from(WarpLicenses)
        .columns("ID")
        .where({ spacefarer_ID: spacefarerID }),
    );
  const existingIDs = new Set(existing.map(({ ID }) => ID));
  const requested = Array.isArray(req.data.warpLicenses)
    ? req.data.warpLicenses
    : [];
  const requestedIDs = requested.map(({ ID }) => ID).filter(Boolean);
  const containsNewLicense = requested.some(
    ({ ID }) => !ID || !existingIDs.has(ID),
  );
  const removesLicense =
    requestedIDs.length !== existingIDs.size ||
    [...existingIDs].some((ID) => !requestedIDs.includes(ID));

  if (containsNewLicense || (!req.user.is(ROLE.ADMIN) && removesLicense)) {
    return req.reject(
      403,
      "Warp licenses can only be issued by the Issue Warp License action; only admins can delete them.",
    );
  }

  for (const license of requested) {
    for (const field of Object.keys(license)) {
      if (field !== "ID" && field !== "status") delete license[field];
    }
  }
}

function validateMandatoryFields(req, Spacefarers) {
  for (const [field, value] of Object.entries(req.data)) {
    if (
      Spacefarers.elements[field]?.["@mandatory"] &&
      (value == null || (typeof value === "string" && !value.trim()))
    ) {
      return req.reject(400, "This field is required.", field);
    }
  }
}

async function validateEmail(req, Spacefarers, emailFormat) {
  if (!Object.hasOwn(req.data, "email")) return;

  const { email } = req.data;
  if (typeof email !== "string" || !emailFormat.test(email)) {
    return req.reject(400, "Enter a valid email address.", "email");
  }

  const duplicate = await cds.tx(req).run(
    SELECT.one
      .from(Spacefarers)
      .columns("ID")
      .where({ email, ID: { "!=": req.data.ID } }),
  );
  if (duplicate) {
    return req.reject(400, "This email address is already in use.", "email");
  }
}

export function readEnumValues(req) {
  return Object.entries(req.target.elements.value.enum).map(
    ([name, entry]) => ({
      value: entry.val ?? name,
    }),
  );
}
