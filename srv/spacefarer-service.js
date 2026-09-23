import cds from "@sap/cds";
import {
  ROLE,
  FIELD_CONTROL,
  PLANET_WRITE_EVENTS,
  PLANET_REFRESH_EVENTS,
  MIN_WORMHOLE_SKILL,
  SIGNUP_STARDUST_BONUS,
} from "./CC.js";

function getAssignedPlanet(req) {
  const planets = [req.user.attr.planet].flat();
  const [planet] = planets;
  const isValid =
    planets.length === 1 && typeof planet === "string" && planet.trim();
  return isValid ? planet : null;
}

export default class SpacefarerService extends cds.ApplicationService {
  async init() {
    const { Spacefarers } = this.entities;
    const draftEntities = [Spacefarers, Spacefarers.drafts];
    this.emailFormat = new RegExp(
      Spacefarers.elements.email["@assert.format"],
      "u",
    );

    this.before(PLANET_WRITE_EVENTS, draftEntities, (req) =>
      this.onBeforePlanetWrite(req),
    );
    this.after(PLANET_REFRESH_EVENTS, draftEntities, (data, req) =>
      this.onAfterPlanetRefresh(data, req),
    );

    this.before("PATCH", Spacefarers.drafts, (req) =>
      this.onBeforeDraftPatch(req, Spacefarers),
    );

    this.after("CREATE", Spacefarers, (data, req) => this.onAfterCreate(req));
    this.on("issueWarpLicense", "*", (req) => this.handleIssueWarpLicense(req));

    await super.init();

    console.log("SpacefarerService initialized");
  }

  onBeforePlanetWrite(req) {
    if (req.user.is(ROLE.ADMIN)) {
      return;
    }

    if (!req.user.is(ROLE.OFFICER)) {
      return;
    }

    const planet = getAssignedPlanet(req);
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

  onAfterPlanetRefresh(data, req) {
    const isAdmin = req.user.is(ROLE.ADMIN);
    for (const row of [data].flat().filter(Boolean)) {
      row.planetFieldControl = isAdmin
        ? FIELD_CONTROL.MANDATORY
        : FIELD_CONTROL.READ_ONLY;
    }
  }

  async onBeforeDraftPatch(req, Spacefarers) {
    if (!Object.hasOwn(req.data, "email")) return;

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
    const spacefarer = await SELECT.one.from(req.subject);
    if (!spacefarer) {
      return req.reject(404, "Spacefarer not found");
    }

    if (expiryDate <= issueDate) {
      return req.reject(400, "Expiry date must be later than the issue date.");
    }

    const licenseNumber = `WL-${Date.now()}`;

    await INSERT.into(this.entities.WarpLicenses).entries({
      spacefarer_ID: spacefarer.ID,
      licenseNumber,
      issueDate,
      expiryDate,
      status: "PENDING",
      clearanceLevel: clearanceLevel ?? 1,
    });

    return SELECT.one
      .from(this.entities.Spacefarers)
      .where({ ID: spacefarer.ID });
  }
}
