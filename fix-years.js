const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const SiteConfigSchema = new mongoose.Schema({
  section: String,
  data: mongoose.Schema.Types.Mixed
}, { strict: false });
const SiteConfig = mongoose.models.SiteConfig || mongoose.model("SiteConfig", SiteConfigSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const configs = await SiteConfig.find({ section: "boardmembers" });
  for (const c of configs) {
    if (c.data && c.data.members) {
      c.data.members.forEach(m => {
        m.year = "2026 - 27";
      });
      c.markModified('data');
      await c.save();
      console.log("Updated config", c._id);
    }
  }
  console.log("Done");
  process.exit(0);
}
run();
