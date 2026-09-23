export async function sendWelcomeNotification(req) {
  const { firstName, lastName, email } = req.data;
  if (!email) {
    console.warn(
      `[@After CREATE] No email on file for ${firstName} ${lastName}, skipping notification.`,
    );
    return;
  }

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
