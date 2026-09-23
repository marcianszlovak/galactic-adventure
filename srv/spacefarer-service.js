import cds from "@sap/cds";
import {
  SPACEFARER_WRITE_EVENTS,
  SPACEFARER_REFRESH_EVENTS,
  WARP_LICENSE_WRITE_EVENTS,
  WARP_LICENSE_CREATE_EVENTS,
  WARP_LICENSE_DELETE_EVENT,
  WARP_LICENSE_ISSUE_ACTION,
  SPACEFARER_DROPDOWN_VALUES,
} from "./CC.js";
import {
  afterSpacefarerRefresh,
  beforeSpacefarerDraftPatch,
  beforeSpacefarerWrite,
  readEnumValues,
} from "./handlers/spacefarer.js";
import { sendWelcomeNotification } from "./handlers/spacefarer-notifications.js";
import {
  afterWarpLicenseRead,
  allowAdminLicenseDeletion,
  beforeWarpLicenseWrite,
  issueWarpLicense,
  rejectDirectLicenseCreation,
} from "./handlers/warp-license.js";

export default class SpacefarerService extends cds.ApplicationService {
  async init() {
    const { Spacefarers, WarpLicenses } = this.entities;
    const draftSpacefarers = [Spacefarers, Spacefarers.drafts];
    const warpLicenses = [WarpLicenses, WarpLicenses.drafts].filter(Boolean);
    const spacefarerDraftDependencies = {
      Spacefarers,
      WarpLicenses,
      emailFormat: new RegExp(
        Spacefarers.elements.email["@assert.format"],
        "u",
      ),
    };

    this.before(
      SPACEFARER_WRITE_EVENTS,
      draftSpacefarers,
      beforeSpacefarerWrite,
    );
    this.after(
      SPACEFARER_REFRESH_EVENTS,
      draftSpacefarers,
      afterSpacefarerRefresh,
    );
    this.before("PATCH", Spacefarers.drafts, (req) =>
      beforeSpacefarerDraftPatch(req, spacefarerDraftDependencies),
    );
    this.after("CREATE", Spacefarers, (_data, req) =>
      sendWelcomeNotification(req),
    );

    this.before(
      WARP_LICENSE_WRITE_EVENTS,
      warpLicenses,
      beforeWarpLicenseWrite,
    );
    this.before(
      WARP_LICENSE_CREATE_EVENTS,
      warpLicenses,
      rejectDirectLicenseCreation,
    );
    this.before(
      WARP_LICENSE_DELETE_EVENT,
      warpLicenses,
      allowAdminLicenseDeletion,
    );
    this.after("READ", warpLicenses, afterWarpLicenseRead);
    this.on(WARP_LICENSE_ISSUE_ACTION, "*", (req) =>
      issueWarpLicense(req, { Spacefarers }),
    );
    this.on("READ", SPACEFARER_DROPDOWN_VALUES, readEnumValues);

    return super.init();
  }
}
