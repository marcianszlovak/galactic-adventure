import cds from "@sap/cds";
import { randomUUID } from "node:crypto";
import {
  ROLE,
  FIELD_CONTROL,
  SPACEFARER_WRITE_EVENTS,
  SPACEFARER_REFRESH_EVENTS,
  WARP_LICENSE_WRITE_EVENTS,
  WARP_LICENSE_CREATE_EVENTS,
  WARP_LICENSE_DELETE_EVENT,
  WARP_LICENSE_ISSUE_ACTION,
  WARP_LICENSE_STATUS,
  WARP_LICENSE_STATUSES,
  WARP_LICENSE_CLEARANCE_LEVEL,
  WARP_LICENSE_NUMBER_PREFIX,
  SPACEFARER_DROPDOWN_VALUES,
} from "./CC.js";

export default class SpacefarerService extends cds.ApplicationService {
  async init() {
    const { Spacefarers, WarpLicenses } = this.entities;

    const draftEntities = [Spacefarers, Spacefarers.drafts];
    const licenseEntities = [WarpLicenses, WarpLicenses.drafts].filter(Boolean);
    this.emailFormat = new RegExp(
      Spacefarers.elements.email["@assert.format"],
      "u",
    );

    this.before(SPACEFARER_WRITE_EVENTS, draftEntities, (req) =>
      this.onBeforePlanetWrite(req),
    );
    this.after(SPACEFARER_REFRESH_EVENTS, draftEntities, (data, req) =>
      this.onAfterSpacefarerRefresh(data, req),
    );

    this.before(WARP_LICENSE_WRITE_EVENTS, licenseEntities, (req) =>
      this.onBeforeWarpLicenseWrite(req),
    );
    this.before(WARP_LICENSE_CREATE_EVENTS, licenseEntities, (req) =>
      req.reject(
        403,
        "Warp licenses can only be issued through the Issue Warp License action.",
      ),
    );
    this.before(WARP_LICENSE_DELETE_EVENT, licenseEntities, (req) => {
      if (!req.user.is(ROLE.ADMIN)) {
        return req.reject(403, "Only admins can delete warp licenses.");
      }
    });
    this.before("PATCH", Spacefarers.drafts, (req) =>
      this.onBeforeDraftPatch(req, Spacefarers, WarpLicenses),
    );
    this.after("READ", licenseEntities, (data, req) =>
      this.onAfterWarpLicenseRead(data, req),
    );

    this.after("CREATE", Spacefarers, (data, req) => this.onAfterCreate(req));
    this.on(WARP_LICENSE_ISSUE_ACTION, "*", (req) =>
      this.handleIssueWarpLicense(req),
    );

    this.on("READ", SPACEFARER_DROPDOWN_VALUES, (req) =>
      Object.entries(req.target.elements.value.enum).map(([name, entry]) => ({
        value: entry.val ?? name,
      })),
    );

    await super.init();

    console.log("SpacefarerService initialized");
  }

  getAssignedPlanet(req) {
    const planets = [req.user.attr.planet].flat();
    const [planet] = planets;
    const isValid =
      planets.length === 1 && typeof planet === "string" && planet.trim();
    return isValid ? planet : null;
  }

  onBeforePlanetWrite(req) {
    if (req.user.is(ROLE.ADMIN)) {
      return;
    }

    if (!req.user.is(ROLE.OFFICER)) {
      return;
    }

    const planet = this.getAssignedPlanet(req);
    if (!planet) {
      return req.reject(
        403,
        "A single current planet must be assigned to your user.",
      );
    }

    const isCreate = req.event === "NEW" || req.event === "CREATE";
    if (isCreate) {
      req.data.originPlanet = planet;
      return;
    }

    const isChangingPlanet =
      Object.hasOwn(req.data, "originPlanet") &&
      req.data.originPlanet !== planet;
    if (isChangingPlanet) {
      return req.reject(
        403,
        "Only admins can change the planet.",
        "originPlanet",
      );
    }
  }

  onAfterSpacefarerRefresh(data, req) {
    const isAdmin = req.user.is(ROLE.ADMIN);
    const isOfficer = req.user.is(ROLE.OFFICER);
    const planet = this.getAssignedPlanet(req);
    for (const row of [data].flat().filter(Boolean)) {
      row.planetFieldControl = isAdmin
        ? FIELD_CONTROL.MANDATORY
        : FIELD_CONTROL.READ_ONLY;
      row.canIssueWarpLicense =
        isAdmin || (isOfficer && row.originPlanet === planet);
    }
  }

  onAfterWarpLicenseRead(data, req) {
    const canEditStatus = req.user.is(ROLE.ADMIN) || req.user.is(ROLE.OFFICER);
    const canDelete = req.user.is(ROLE.ADMIN);
    for (const row of [data].flat().filter(Boolean)) {
      row.licenseStatusFieldControl = canEditStatus
        ? FIELD_CONTROL.MANDATORY
        : FIELD_CONTROL.READ_ONLY;
      row.canDeleteLicense = canDelete;
    }
  }

  onBeforeWarpLicenseWrite(req) {
    if (
      Object.hasOwn(req.data, "status") &&
      !WARP_LICENSE_STATUSES.includes(req.data.status)
    ) {
      return req.reject(400, "Select a valid license status.", "status");
    }

    for (const field of Object.keys(req.data)) {
      if (field !== "status") delete req.data[field];
    }
  }

  async onBeforeDraftPatch(req, Spacefarers, WarpLicenses) {
    if (Object.hasOwn(req.data, "warpLicenses")) {
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
          if (field !== "ID" && field !== "status") {
            delete license[field];
          }
        }
      }
    }

    for (const [field, value] of Object.entries(req.data)) {
      if (
        Spacefarers.elements[field]?.["@mandatory"] &&
        (value == null || (typeof value === "string" && !value.trim()))
      ) {
        return req.reject(400, "This field is required.", field);
      }
    }

    if (!Object.hasOwn(req.data, "email")) {
      return;
    }

    const { email } = req.data;
    if (typeof email !== "string" || !this.emailFormat.test(email)) {
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

  async onAfterCreate(req) {
    const { firstName, lastName, email } = req.data;

    if (!email) {
      console.warn(
        `[@After CREATE] No email on file for ${firstName} ${lastName}, skipping notification.`,
      );
      return;
    }

    await this.sendCosmicWelcomeEmail({ email, firstName, lastName });
  }

  async sendCosmicWelcomeEmail({ email, firstName, lastName }) {
    console.log(`
    ================================
    🚀 COSMIC NOTIFICATION EMAIL 🚀
    To: ${email}
    Subject: Welcome aboard, ${firstName}!

    Dear ${firstName} ${lastName},

    Congratulations! Your journey among the stars has begun.
    Your spacesuit is fitted, your stardust reserves are stocked,
    and the galaxy awaits your wormhole navigation skills.

    Safe travels, spacefarer.
    ================================
    `);
  }

  async handleIssueWarpLicense(req) {
    const { clearanceLevel, issueDate, expiryDate } = req.data;
    if (!issueDate || !expiryDate) {
      return req.reject(400, "Issue date and expiry date are required.");
    }

    if (
      clearanceLevel != null &&
      (clearanceLevel < WARP_LICENSE_CLEARANCE_LEVEL.MIN ||
        clearanceLevel > WARP_LICENSE_CLEARANCE_LEVEL.MAX)
    ) {
      return req.reject(400, "Clearance level must be between 1 and 10.");
    }

    const spacefarer = await SELECT.one.from(req.subject);
    if (!spacefarer) {
      return req.reject(404, "Spacefarer not found");
    }

    const openDraft = await cds
      .tx(req)
      .run(
        SELECT.one
          .from(this.entities.Spacefarers.drafts)
          .columns("ID")
          .where({ ID: spacefarer.ID }),
      );
    if (openDraft) {
      return req.reject(
        409,
        "Finish editing the Spacefarer before issuing a warp license.",
      );
    }

    if (expiryDate <= issueDate) {
      return req.reject(400, "Expiry date must be later than the issue date.");
    }

    const licenseNumber = `${WARP_LICENSE_NUMBER_PREFIX}${randomUUID()
      .replaceAll("-", "")
      .slice(0, 16)}`;

    await cds.tx(req).run(
      INSERT.into("galactic.spacefarer.WarpLicenses").entries({
        spacefarer_ID: spacefarer.ID,
        licenseNumber,
        issueDate,
        expiryDate,
        status: WARP_LICENSE_STATUS.PENDING,
        clearanceLevel: clearanceLevel ?? WARP_LICENSE_CLEARANCE_LEVEL.MIN,
      }),
    );

    return spacefarer;
  }
}
