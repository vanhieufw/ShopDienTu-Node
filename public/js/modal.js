const btnCart = document.querySelector(".navbar__actions-item--cart");
const modal   = document.querySelector(".modal-cart");

// Hàm đóng modal
function closeModal() {
  modal.classList.remove("show");
  modal.classList.add("hide");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("hide");
  }, 300); // khớp với thời gian transition
}

// Mở modal khi click icon giỏ hàng
btnCart.addEventListener("click", function () {
  modal.classList.remove("hidden", "hide");
  void modal.offsetWidth; // reset animation
  modal.classList.add("show");
});

// Event delegation: lắng nghe click trên body
document.body.addEventListener("click", function (e) {
  if (
    e.target.closest(".modal-cart__close-btn") || // nút đóng
    e.target.closest(".modal-cart__overlay")     || // overlay
    e.target.closest(".close-modal-btn")      // nút tiếp tục mua sắm (nếu có)
  ) {
    closeModal();
  }
});
















// auth
// Lấy phần tử chính
document.addEventListener("DOMContentLoaded", function() {
    // === 1. LẤY CÁC PHẦN TỬ (ELEMENTS) ===

    const btnUser = document.querySelector(".navbar__actions-item--user");
    const modalAuth = document.querySelector(".modal.auth-modal");
    const overlayAuth = document.querySelector(".modal__overlay");

    // Forms
    const loginForm = document.querySelector(".auth-form--login");
    const registerForm = document.querySelector(".auth-form--register");
    const forgotForm = document.querySelector(".auth-form--forgot");
    const otpNewPassForm = document.querySelector(".auth-form--otp-newpass");

    // Các trường Input quan trọng
    const forgotEmailInput = forgotForm ? forgotForm.querySelector('input[name="email"]') : null;
    const resetEmailHiddenInput = document.getElementById("reset-email-input"); // Trường email ẩn trong form OTP

    // Link chuyển form
    const switchToRegister = document.querySelector(".switch-to-register");
    const switchToLogin = document.querySelector(".switch-to-login");
    const switchToForgot = document.querySelector(".auth-form__forgot-password-link");
    const switchToLoginFromForgot = document.querySelector(".switch-to-login-from-forgot");
    const switchToForgotFromOtp = document.querySelector(".auth-form--otp-newpass .switch-to-forgot");

    // Form Submit
    const formSendOtp = forgotForm ? forgotForm.querySelector('form') : null;
    const formResetPass = otpNewPassForm ? otpNewPassForm.querySelector('form.form-reset-password') : null;


    // === TỰ ĐỘNG HIỆN MODAL KHI CÓ SESSION show_login_modal ===
    if (modalAuth && modalAuth.dataset.hasError === 'true') {
        // Modal đã được mở sẵn từ server (không có class hidden)
        // Kiểm tra xem có phải là trường hợp show_login_modal không
        if (!loginForm.classList.contains('hidden') && 
            registerForm.classList.contains('hidden') && 
            forgotForm.classList.contains('hidden')) {
            // Đây là trường hợp show_login_modal
            // Modal và form login đã được hiện sẵn, không cần làm gì thêm
        }
    }

    // === 2. HÀM CHUYỂN ĐỔI FORM (View Logic) ===

    function hideAllAuthForms() {
    // 1. ẨN TẤT CẢ CÁC FORM
    loginForm && loginForm.classList.add("hidden");
    registerForm && registerForm.classList.add("hidden");
    forgotForm && forgotForm.classList.add("hidden");
    otpNewPassForm && otpNewPassForm.classList.add("hidden");
    
    // 2. XÓA TẤT CẢ LỖI VALIDATION VÀ THÔNG BÁO LỖI CHUNG
    // Điều này đảm bảo rằng khi form được hiển thị lại, nó sẽ sạch sẽ.
    clearFormErrors(loginForm); 
    clearFormErrors(registerForm);
    clearFormErrors(forgotForm);
    clearFormErrors(otpNewPassForm);

    loginForm && loginForm.querySelector('form').reset();
    registerForm && registerForm.querySelector('form').reset();
    forgotForm && forgotForm.querySelector('form').reset();
    otpNewPassForm && otpNewPassForm.querySelector('form').reset();
    }

    function showLoginForm() {
        hideAllAuthForms();
        // Đảm bảo Form Đăng nhập hiển thị sau khi mọi thứ đã được dọn dẹp
        loginForm && loginForm.classList.remove("hidden");
    }

    function showRegisterForm() {
        hideAllAuthForms();
        registerForm && registerForm.classList.remove("hidden");
    }

    function showForgotForm() {
        hideAllAuthForms();
        forgotForm && forgotForm.classList.remove("hidden");
    }

    function showOtpNewPassForm() {
        hideAllAuthForms();
        otpNewPassForm && otpNewPassForm.classList.remove("hidden");
    }

    // Hàm clearFormErrors (Giữ nguyên)
    function clearFormErrors(form) {
        if (!form) return;
        // Xóa lỗi hiển thị dưới dạng <span>
        form.querySelectorAll('span[style="color:red"]').forEach(span => span.remove());
        // Xóa lỗi hiển thị dưới dạng div chung
        form.querySelectorAll('.error-message').forEach(div => div.remove());
    }

    // Hàm displayErrors (Giữ nguyên)
    function displayErrors(form, errors) {
        clearFormErrors(form);
        const errorContainer = form.querySelector('.auth-form__form');
        if (!errorContainer) return;
        
        for (const key in errors) {
            const messages = errors[key];
            const inputGroup = form.querySelector(`input[name="${key}"]`) ? 
                            form.querySelector(`input[name="${key}"]`).closest('.auth-form__input-group') :
                            null;

            // Nếu lỗi liên quan đến input cụ thể (ví dụ: email, password, otp)
            if (inputGroup) {
                messages.forEach(message => {
                    const errorSpan = document.createElement('span');
                    errorSpan.style.color = 'red';
                    errorSpan.textContent = message;
                    inputGroup.after(errorSpan);
                });
            } else {
                // Lỗi chung (ví dụ: lỗi validation không gắn với input nào)
                messages.forEach(message => {
                    const errorDiv = document.createElement('div');
                    errorDiv.classList.add('error-message');
                    errorDiv.style.color = 'red';
                    errorDiv.textContent = message;
                    errorContainer.prepend(errorDiv);
                });
            }
        }
    }


    // === 3. SỰ KIỆN MỞ/ĐÓNG MODAL ===

    btnUser && btnUser.addEventListener("click", () => {
        if (modalAuth && modalAuth.classList.contains('hidden')) {
            modalAuth.classList.remove("hidden");
            // Mặc định hiển thị form Login nếu không có lỗi/session server
            if (modalAuth.dataset.hasError !== 'true') {
                 showLoginForm();
            }
        }
    });

    overlayAuth && overlayAuth.addEventListener("click", () => {
        modalAuth && modalAuth.classList.add("hidden");
    });


    // === 4. SỰ KIỆN CHUYỂN FORM (Links) ===

    switchToRegister && switchToRegister.addEventListener("click", (e) => {
        e.preventDefault();
        showRegisterForm();
    });

    switchToLogin && switchToLogin.addEventListener("click", (e) => {
        e.preventDefault();
        showLoginForm();
    });

    switchToForgot && switchToForgot.addEventListener("click", (e) => {
        e.preventDefault();
        showForgotForm();
    });

    switchToLoginFromForgot && switchToLoginFromForgot.addEventListener("click", (e) => {
        e.preventDefault();
        showLoginForm();
    });

    switchToForgotFromOtp && switchToForgotFromOtp.addEventListener("click", (e) => {
        e.preventDefault();
        showForgotForm();
    });


    // === 5. LOGIC AJAX CHO QUÊN MẬT KHẨU ===

    // 5.1 Xử lý Form GỬI OTP (Form 3)
    if (formSendOtp) {
        formSendOtp.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = forgotEmailInput.value;
            const url = this.action;
            const csrfToken = this.querySelector('input[name="_token"]').value;
            
            // Xóa lỗi cũ và hiển thị loading nếu cần
            clearFormErrors(forgotForm); 
            // Vô hiệu hóa nút submit để tránh double click
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json' 
                },
                body: JSON.stringify({ email: email })
            })
            .then(response => {
                submitBtn.disabled = false;
                if (response.ok) {
                    return response.json();
                }
                // Nếu lỗi Validation (422) hoặc lỗi server khác
                return response.json().then(errorData => {
                    // Nếu là lỗi Validation (422)
                    if (response.status === 422 && errorData.errors) {
                        displayErrors(forgotForm, errorData.errors);
                        throw new Error('Validation Failed'); 
                    }
                    // Các lỗi khác
                    throw new Error(errorData.message || 'Có lỗi xảy ra khi gửi OTP.');
                });
            })
            .then(data => {
                // Thành công: Chuyển sang Form Nhập OTP
                if (data.status === 'success') {
                    // 1. Lưu email vào trường ẩn của form OTP
                    if(resetEmailHiddenInput) {
                        resetEmailHiddenInput.value = email;
                    }
                    
                    // 2. Hiển thị thông báo (ví dụ dùng alert hoặc thư viện toast)
                    showToast(data.message, 'success');
                    
                    // 3. Chuyển form
                    showOtpNewPassForm();
                }
            })
            .catch(error => {
                console.error('Lỗi AJAX:', error);
                // Nếu chưa hiển thị lỗi validation, hiển thị lỗi chung
                if (error.message && error.message !== 'Validation Failed') {
                     alert(error.message);
                }
            });
        });
    }


    // 5.2 Xử lý Form RESET MẬT KHẨU (Form 4)
    if (formResetPass) {
        formResetPass.addEventListener('submit', function(e) {
            e.preventDefault();
            const url = this.action;
            const formData = new FormData(this); // Lấy tất cả dữ liệu form (bao gồm email, otp, pass)
            const data = Object.fromEntries(formData.entries());
            const csrfToken = this.querySelector('input[name="_token"]').value;

            // Xóa lỗi cũ
            clearFormErrors(otpNewPassForm);
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                submitBtn.disabled = false;
                if (response.ok) {
                    return response.json();
                }
                return response.json().then(errorData => {
                    if (response.status === 422 && errorData.errors) {
                        displayErrors(otpNewPassForm, errorData.errors);
                        throw new Error('Validation Failed');
                    }
                    throw new Error(errorData.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.');
                });
            })
            .then(data => {
                // Thành công: Thông báo và chuyển về form Đăng nhập
                if (data.status === 'success') {
                    alert(data.message);
                    modalAuth && modalAuth.classList.add("hidden");
                    // Xóa dữ liệu form sau khi thành công
                    formResetPass.reset(); 
                }
            })
            .catch(error => {
                console.error('Lỗi AJAX:', error);
                if (error.message && error.message !== 'Validation Failed') {
                    alert(error.message);
                }
            });
        });
    }

    // === LOGIC XỬ LÝ USER ĐÃ ĐĂNG NHẬP ===

const btnUserLoggedIn = document.querySelector(".navbar__actions-item--logged-in");
const userDropdown = document.querySelector(".user-dropdown");

if (btnUserLoggedIn && userDropdown) {
    btnUserLoggedIn.addEventListener("click", () => {
        // Chuyển đổi trạng thái hiển thị của dropdown
        userDropdown.classList.toggle("hidden");
    });
    
    // Đóng dropdown khi click ra ngoài
    document.addEventListener("click", (e) => {
        if (!btnUserLoggedIn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.add("hidden");
        }
    });
}

});