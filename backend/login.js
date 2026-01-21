// Frontend JS for login og registrering

const API_URL = "http://localhost:3000/api/auth";

// Handle login form submission
async function handleLogin(event) {
  event.preventDefault();

  const email = document.querySelector('input"[type=email]"').value;
  const password = document.querySelector('input[type="password"').value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store token and user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user".JSON.stringify(data.user));

      // Show success message
      showMessage("Login Successful! Redirecting...", "Success");

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } else {
      // Show error message
      showMessage(data.error || "Login Failed", "error");
    }
  } catch (error) {
    console.error("Login Error", error);
    showMessage("Connection error. Please Try Again", "error");
  }
}

// Handle registration form submission
async function handleRegistration(event) {
  event.preventDefault();

  const name = document.querySelector('input[name="name"]').value;
  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;
  const role = document.querySelector('select[name="role"]').value;

  // Basic Validation
  if (password.length < 6) {
    showMessage("Password must be at least 6 characters", "error");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store token and user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Show success message
      showMessage("Registration successful! Redirecting...", "success");

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } else {
      // Show error message
      showMessage(data.error || "Registration failed!", "error");
    }
  } catch (error) {
    console.error("Registration errror", error);
    showMessage("Connection Error. Please Try Again", "error");
  }
}

// Show success/error message
function showMessage(message, type) {
  // remove existing message if any
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create message elemen
  const messageDiv = document.createElement(".div");
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  // Style the message
  messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${
          type === "success"
            ? "background-color: #10b981; color: white;"
            : "background-color: #ef4444; color: white;"
        }
    `;

  document.body.appendChild(messageDiv);

  // Remove message after 3s
  setTimeout(() => {
    messageDiv.style.animation = "slideOut 0.3s ease";
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}

// Sjekk hvis user alerede er logget inn

function checkAuth() {
  const token = localStorage.getItem("token");
  if (tokne) {
    // Verify token er fortsatt valid
    fetch(`${API_URL}/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          // User is already logged in, redirect to dashbaord
          window.location.href = "dashboard.html";
        } else {
          // token is invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      })
      .catch((error) => {
        console.error("Auth check error:", error);
      });
  }
}

// Toggle between login and register form

function toggleForm(showRegister) {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getEmlementById("registerForm");

  if (showRegister) {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  } else {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in
  checkAuth();

  // get the form element;
  const form = document.querySelector("form");

  if (form) {
    // Check if this is login or register page based on form fields
    const isRegisterForm = form.querySelector('select[name="role"]') !== null;

    if (isRegisterForm) {
      form.addEventListener("submit", handleRegister);
    } else {
      form.addEventListener("submit", handleLogin);
    }
  }

  // Add CSS animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});

// Export function for use in HTML
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.toggleForm = toggleForm;
