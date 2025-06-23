import { initializeAdUnit } from "@givefreely/adunit"

import { Storage } from "@plasmohq/storage"

const storage = new Storage()
const ADS_INITIALIZED_KEY = "ads_initialized_timestamp"
const ADS_INITIALIZED_URL_KEY = "ads_initialized_url"

let isInitializing = false
let isInitialized = false

const ads = async () => {
  if (isInitializing || isInitialized) {
    console.log("Ads initialization already in progress or completed")
    return
  }

  isInitializing = true

  try {
    const currentUrl = window.location.href
    const now = Math.floor(Date.now() / 1000)

    const lastInitialized = await storage.get(ADS_INITIALIZED_KEY)
    const lastInitializedUrl = await storage.get(ADS_INITIALIZED_URL_KEY)

    const success = await initializeContent()

    if (success) {
      await storage.set(ADS_INITIALIZED_KEY, now.toString())
      await storage.set(ADS_INITIALIZED_URL_KEY, currentUrl)
      isInitialized = true
      console.log("Ads initialized successfully for:", currentUrl)
    }
  } catch (error) {
    console.error("Error in ads initialization:", error)
  } finally {
    isInitializing = false
  }
}

async function initializeContent(): Promise<boolean> {
  if (isInitialized) {
    return true
  }

  if (document.body) {
    try {
      console.log("Attempting to initialize AdUnit")
      await initializeAdUnit()
      console.log("AdUnit initialized successfully")
      return true
    } catch (error) {
      console.error("Error initializing AdUnit:", error)
      return false
    }
  } else {
    console.warn("Document body not available yet")

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error("Timeout waiting for document body")
        resolve(false)
      }, 5000)

      const checkBody = async () => {
        if (document.body && !isInitialized) {
          clearTimeout(timeout)
          const result = await initializeContent()
          resolve(result)
        } else if (!document.body) {
          setTimeout(checkBody, 50)
        } else {
          clearTimeout(timeout)
          resolve(true)
        }
      }

      checkBody()
    })
  }
}

const handlePageNavigation = async () => {
  const currentUrl = window.location.href
  const lastUrl = await storage.get(ADS_INITIALIZED_URL_KEY)

  if (lastUrl && lastUrl !== currentUrl) {
    isInitialized = false
    isInitializing = false
    console.log("Page navigation detected, resetting ads initialization")
  }
}

let lastUrl = window.location.href
const observer = new MutationObserver(() => {
  if (lastUrl !== window.location.href) {
    lastUrl = window.location.href
    handlePageNavigation()
  }
})

observer.observe(document.body || document.documentElement, {
  childList: true,
  subtree: true
})

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ads)
} else {
  setTimeout(ads, 100)
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !isInitialized) {
    setTimeout(ads, 100)
  }
})

export default ads
