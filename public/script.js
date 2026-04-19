// Get all DOM elements
const urlForm = document.getElementById("urlForm");
const urlInput = document.getElementById("urlInput");
const btnText = document.getElementById("btnText");
const spinner = document.getElementById("spinner");
const urlError = document.getElementById("urlError");
const resultSection = document.getElementById("resultSection");
const shortUrlInput = document.getElementById("shortUrl");
const copyBtn = document.getElementById("copyBtn");
const copyText = document.getElementById("copyText");
const testLink = document.getElementById("testLink");
const originalUrl = document.getElementById("originalUrl");
const loadingMessage = document.getElementById("loadingMessage");
const successMessage = document.getElementById("successMessage");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");

// Get the base URL for API calls
const API_BASE_URL = window.location.origin;

// Form submission
urlForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = urlInput.value.trim();

  // Validate URL format
  if (!isValidUrl(url)) {
    showError("Please enter a valid URL");
    return;
  }

  // Clear previous messages
  hideAllMessages();

  // Show loading state
  showLoading();

  try {
    // Make API request to shorten URL
    const response = await fetch(`${API_BASE_URL}/chotakar/postUrl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    // Check if the response has the required data
    if (!data.shortUrl) {
      throw new Error("Invalid response from server");
    }

    // Display result
    displayResult(data.shortUrl, url);
    showSuccess();
  } catch (error) {
    console.error("Error:", error);
    const errorMsg =
      error.message || "Failed to shorten URL. Please try again.";
    showErrorMessage(errorMsg);
  } finally {
    hideLoading();
  }
});

// Copy button functionality
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(shortUrlInput.value);

    // Change button text temporarily
    const originalText = copyText.textContent;
    copyText.textContent = "✅ Copied!";

    setTimeout(() => {
      copyText.textContent = originalText;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy:", error);
    showErrorMessage("Failed to copy URL");
  }
});

// Validate URL format
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// Display result
function displayResult(shortUrl, originalUrlString) {
  shortUrlInput.value = shortUrl;
  testLink.href = shortUrl;
  testLink.textContent = shortUrl;
  originalUrl.href = originalUrlString;
  originalUrl.textContent = originalUrlString;

  resultSection.classList.remove("hidden");

  // Scroll to result
  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: "smooth" });
  }, 100);
}

// Show loading state
function showLoading() {
  loadingMessage.classList.remove("hidden");
  urlForm.querySelector("button").disabled = true;
  spinner.classList.remove("hidden");
  btnText.textContent = "Creating...";
}

// Hide loading state
function hideLoading() {
  loadingMessage.classList.add("hidden");
  urlForm.querySelector("button").disabled = false;
  spinner.classList.add("hidden");
  btnText.textContent = "Shorten URL";
}

// Show error message
function showError(message) {
  urlError.textContent = message;
  urlError.classList.remove("hidden");

  // Clear error after 5 seconds
  setTimeout(() => {
    urlError.classList.add("hidden");
  }, 5000);
}

// Show success message
function showSuccess() {
  successMessage.classList.remove("hidden");

  // Hide after 3 seconds
  setTimeout(() => {
    successMessage.classList.add("hidden");
  }, 3000);
}

// Show error message (general)
function showErrorMessage(message) {
  errorText.textContent = message;
  errorMessage.classList.remove("hidden");

  // Hide after 5 seconds
  setTimeout(() => {
    errorMessage.classList.add("hidden");
  }, 5000);
}

// Hide all messages
function hideAllMessages() {
  successMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");
  urlError.classList.add("hidden");
}

// Add keyboard shortcut: Enter in input field
urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    urlForm.dispatchEvent(new Event("submit"));
  }
});

// Clear error message on input
urlInput.addEventListener("input", () => {
  if (urlError.classList.contains("hidden") === false) {
    urlError.classList.add("hidden");
  }
});

// Set focus on load
window.addEventListener("load", () => {
  urlInput.focus();
});
