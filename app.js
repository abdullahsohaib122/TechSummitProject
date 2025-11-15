/* app.js - handles dark mode, validations, storage, redirect, summary rendering */

/* -------------------------
   Utility & DOM references
   -------------------------*/
const isSummary = location.pathname.includes("summary.html");
const isRegister = location.pathname.includes("register.html");
const isIndex = location.pathname.endsWith("index.html") || location.pathname.endsWith("/") || location.pathname.includes("index");

const darkButtons = [
  document.getElementById('darkToggle'),
  document.getElementById('darkToggleNav'),
  document.getElementById('darkToggleSummary')
].filter(Boolean);

function setDarkMode(on) {
  if (on) document.body.classList.add('dark');
  else document.body.classList.remove('dark');
  localStorage.setItem('dark', on ? '1' : '0');
}

/* Initialize dark mode from localStorage */
(function initDark() {
  const dark = localStorage.getItem('dark') === '1';
  setDarkMode(dark);
  darkButtons.forEach(btn => {
    btn.textContent = dark ? 'Light' : 'Dark';
    btn.onclick = () => {
      const newVal = !document.body.classList.contains('dark');
      setDarkMode(newVal);
      darkButtons.forEach(b => b.textContent = newVal ? 'Light' : 'Dark');
    };
  });
})();

/* -------------------------
   Validation config
   -------------------------*/
const patterns = {
  name: /^[A-Za-z ]{3,}$/,         // alphabets + spaces, min 3 chars
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^03\d{9}$/,             // starts with 03 and 11 digits total
  cnic: /^\d{13}$/,               // 13 digits
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/ // min8, upper, lower, digit, special
};

/* -------------------------
   Registration page logic
   -------------------------*/
if (isRegister) {
  // get elements
  const form = document.getElementById('regForm');
  const nameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const cnicInput = document.getElementById('cnic');
  const deptInput = document.getElementById('department');
  const passInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');
  const submitBtn = document.getElementById('submitBtn');
  const successAlert = document.getElementById('successAlert');

  // error displays
  const nameErr = document.getElementById('nameErr');
  const emailErr = document.getElementById('emailErr');
  const phoneErr = document.getElementById('phoneErr');
  const cnicErr = document.getElementById('cnicErr');
  const deptErr = document.getElementById('deptErr');
  const genderErr = document.getElementById('genderErr');
  const passErr = document.getElementById('passErr');
  const confirmErr = document.getElementById('confirmErr');

  // validation state
  const valid = {
    name: false, email: false, phone: false, cnic: false,
    dept: false, gender: false, password: false, confirm: false
  };

  function updateSubmitState() {
    const allValid = Object.values(valid).every(v => v === true);
    submitBtn.disabled = !allValid;
  }

  // helpers for messages
  function ok(el) { el.textContent = ''; }
  function fail(el, msg) { el.textContent = msg; }

  // real-time listeners
  nameInput.addEventListener('input', () => {
    valid.name = patterns.name.test(nameInput.value.trim());
    valid.name ? ok(nameErr) : fail(nameErr, 'Enter at least 3 alphabets (letters and spaces only).');
    updateSubmitState();
  });

  emailInput.addEventListener('input', () => {
    valid.email = patterns.email.test(emailInput.value.trim());
    valid.email ? ok(emailErr) : fail(emailErr, 'Enter a valid email address.');
    updateSubmitState();
  });

  phoneInput.addEventListener('input', () => {
    // remove non-digits for easier typing but keep value display
    phoneInput.value = phoneInput.value.replace(/[^\d]/g,'').slice(0,11);
    valid.phone = patterns.phone.test(phoneInput.value);
    valid.phone ? ok(phoneErr) : fail(phoneErr, 'Phone must start with 03 and be 11 digits.');
    updateSubmitState();
  });

  cnicInput.addEventListener('input', () => {
    cnicInput.value = cnicInput.value.replace(/[^\d]/g,'').slice(0,13);
    valid.cnic = patterns.cnic.test(cnicInput.value);
    valid.cnic ? ok(cnicErr) : fail(cnicErr, 'CNIC must be exactly 13 digits (no dashes).');
    updateSubmitState();
  });

  deptInput.addEventListener('change', () => {
    valid.dept = deptInput.value !== '';
    valid.dept ? ok(deptErr) : fail(deptErr, 'Please select your department.');
    updateSubmitState();
  });

  // gender radios
  const genderRadios = document.querySelectorAll('input[name="gender"]');
  genderRadios.forEach(r => r.addEventListener('change', () => {
    valid.gender = !!document.querySelector('input[name="gender"]:checked');
    valid.gender ? ok(genderErr) : fail(genderErr, 'Select a gender.');
    updateSubmitState();
  }));

  passInput.addEventListener('input', () => {
    valid.password = patterns.password.test(passInput.value);
    valid.password ? ok(passErr) : fail(passErr, 'Password must be 8+ chars with upper, lower, number, and special char.');
    // also re-validate confirm
    valid.confirm = confirmInput.value === passInput.value && confirmInput.value.length > 0;
    valid.confirm ? ok(confirmErr) : fail(confirmErr, 'Passwords do not match.');
    updateSubmitState();
  });

  confirmInput.addEventListener('input', () => {
    valid.confirm = confirmInput.value === passInput.value && confirmInput.value.length > 0;
    valid.confirm ? ok(confirmErr) : fail(confirmErr, 'Passwords do not match.');
    updateSubmitState();
  });

  // initial call in case browser pre-fills
  [nameInput, emailInput, phoneInput, cnicInput, deptInput, passInput, confirmInput].forEach(i => i.dispatchEvent(new Event('input')));

  // submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // final check
    if (!Object.values(valid).every(v => v)) {
      // if somehow invalid, highlight
      if (!valid.name) nameErr.textContent = 'Please fix your name';
      if (!valid.email) emailErr.textContent = 'Please fix your email';
      return;
    }

    // gather data (do NOT store passwords in plain localStorage)
    const data = {
      fullName: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      cnic: cnicInput.value.trim(),
      department: deptInput.value,
      gender: document.querySelector('input[name="gender"]:checked')?.value || ''
    };

    // show success alert
    successAlert.classList.remove('d-none');

    // save to localStorage
    localStorage.setItem('techSummitUser', JSON.stringify(data));

    // brief animation: disable button and show spinner
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...`;

    // redirect after 2 seconds
    setTimeout(() => {
      window.location.href = 'summary.html';
    }, 2000);
  });
}

/* -------------------------
   Summary page logic
   -------------------------*/
if (isSummary) {
  const summaryBody = document.getElementById('summaryBody');
  const clearBtn = document.getElementById('clearStorage');

  function renderSummary() {
    const raw = localStorage.getItem('techSummitUser');
    if (!raw) {
      summaryBody.innerHTML = `<tr><td colspan="2" class="text-center">No registration data found. Please register first.</td></tr>`;
      return;
    }
    const data = JSON.parse(raw);
    const rows = Object.entries(data).map(([key, val]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      return `<tr><th style="width:35%">${label}</th><td>${val}</td></tr>`;
    }).join('');
    summaryBody.innerHTML = rows;
  }

  renderSummary();

  clearBtn && clearBtn.addEventListener('click', () => {
    localStorage.removeItem('techSummitUser');
    renderSummary();
  });
}

/* -------------------------
   Small safety: if user opens register.html without index, you can still go home
   -------------------------*/

function setDarkMode(on) {
  if (on) {
    document.body.classList.add('dark');
    document.querySelectorAll('.navbar, .card, footer').forEach(el => el.classList.add('dark'));
  } else {
    document.body.classList.remove('dark');
    document.querySelectorAll('.navbar, .card, footer').forEach(el => el.classList.remove('dark'));
  }
  localStorage.setItem('dark', on ? '1' : '0');
}
