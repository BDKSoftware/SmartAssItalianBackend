module.exports = ({ env }) => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
  },
  apiToken: {
    salt: "T+Qt/kdx7PfHw8rD/LZ5XQ==",
  },
  transfer: {
    token: {
      salt: "eSXJJmDBt4jBYRcR7a7drQ==",
    },
  },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", true),
  },
});
