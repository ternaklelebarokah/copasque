// ============================================================
//  LinkVault - Auth Helper
//  Dipakai di login.html dan index.html
// ============================================================

// ---- Login Page Logic ----
// Hanya jalan kalau ada form #loginForm (login.html)
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const emailInput    = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");
  const loginBtn      = document.getElementById("loginBtn");
  const loginBtnContent = document.getElementById("loginBtnContent");
  const errorAlert    = document.getElementById("errorAlert");
  const errorMsg      = document.getElementById("errorMsg");
  const togglePassword= document.getElementById("togglePassword");
  const eyeIcon       = document.getElementById("eyeIcon");
  const eyeOffIcon    = document.getElementById("eyeOffIcon");

  // Kalau sudah login, langsung ke halaman utama
  if (supabaseClient) {
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.replace("index.html");
      }
    });
  }

  // Show/hide password toggle
  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    eyeIcon.classList.toggle("hidden", isPassword);
    eyeOffIcon.classList.toggle("hidden", !isPassword);
  });

  // Login submit
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!supabaseClient) {
      showError("Supabase belum dikonfigurasi. Buka config.js.");
      return;
    }

    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    setLoading(true);
    hideError();

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Sukses — redirect ke halaman utama
      window.location.replace("index.html");
    } catch (err) {
      const msg = err.message.includes("Invalid login")
        ? "Email atau password salah."
        : err.message;
      showError(msg);
    } finally {
      setLoading(false);
    }
  });

  function setLoading(loading) {
    loginBtn.disabled = loading;
    loginBtnContent.innerHTML = loading
      ? `<div class="spinner"></div><span>Masuk...</span>`
      : `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
           <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
         </svg>
         <span>Masuk</span>`;
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorAlert.classList.remove("hidden");
  }

  function hideError() {
    errorAlert.classList.add("hidden");
  }
}


// ---- Guard untuk index.html ----
// Cek session, kalau tidak ada redirect ke login
async function requireAuth() {
  if (!supabaseClient) return;

  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.replace("login.html");
    return null;
  }

  return data.session;
}


// ---- Logout ----
async function logout() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  window.location.replace("login.html");
}

window.logout = logout;
