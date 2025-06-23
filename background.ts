import {
  GiveFreelyService,
  isAdUnitMessage
} from "@givefreely/adunit/background"

const giveFreely = new GiveFreelyService("csspeeperprod");

(async () => {
  try {
    await giveFreely.initialize();
    console.log("Give Freely background initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Give Freely:", error);
  }
})();

chrome.runtime.onMessage.addListener((data, sender) => {
  if (isAdUnitMessage(data)) {
    return
  }
})
