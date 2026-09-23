import cds from "@sap/cds";
import { randomUUID } from "node:crypto";
import {
  ROLE,
  FIELD_CONTROL,
  WARP_LICENSE_STATUS,
  WARP_LICENSE_STATUSES,
  WARP_LICENSE_CLEARANCE_LEVEL,
  WARP_LICENSE_NUMBER_PREFIX,
} from "../CC.js";

export function beforeWarpLicenseWrite(req) {
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

export function rejectDirectLicenseCreation(req) {
  return req.reject(
    403,
    "Warp licenses can only be issued through the Issue Warp License action.",
  );
}

export function allowAdminLicenseDeletion(req) {
  if (!req.user.is(ROLE.ADMIN)) {
    return req.reject(403, "Only admins can delete warp licenses.");
  }
}

export function afterWarpLicenseRead(data, req) {
  const canEditStatus = req.user.is(ROLE.ADMIN) || req.user.is(ROLE.OFFICER);
  const canDelete = req.user.is(ROLE.ADMIN);

  for (const row of [data].flat().filter(Boolean)) {
    row.licenseStatusFieldControl = canEditStatus
      ? FIELD_CONTROL.MANDATORY
      : FIELD_CONTROL.READ_ONLY;
    row.canDeleteLicense = canDelete;
  }
}

export async function issueWarpLicense(req, { Spacefarers }) {
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
  if (!spacefarer) return req.reject(404, "Spacefarer not found");

  const openDraft = await cds
    .tx(req)
    .run(
      SELECT.one
        .from(Spacefarers.drafts)
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
