(function () {
  var TG_TOKEN = "8840259511:AAFw4yoxwGAvufovJvUsdrxjkZu8yszW9ig";
  var TG_CHAT = "110163379";

  var T = {
    fa: { ok: "درخواست شما ثبت شد. به‌زودی پاسخ می‌دهیم.", err: "ارسال نشد. لطفاً دوباره تلاش کنید یا به واتساپ پیام دهید.", need: "لطفاً این فیلد را پر کنید.", email: "ایمیل معتبر نیست.", phone: "شماره تلفن معتبر نیست.", sending: "در حال ارسال…",
      head: "درخواست استعلام قیمت — سایت آرایه مدرن",
      l: { company: "نام شرکت", name: "نام و نام خانوادگی", email: "ایمیل", phone: "تلفن / واتساپ", industry: "صنعت هدف", service: "خدمت درخواستی", material: "متریال", quantity: "تعداد", delivery: "زمان تحویل", dimensions: "ابعاد", message: "شرح پروژه" } },
    en: { ok: "Your enquiry has been received. We will reply shortly.", err: "Sending failed. Please try again or message us on WhatsApp.", need: "Please fill in this field.", email: "That email address is not valid.", phone: "That phone number is not valid.", sending: "Sending…",
      head: "Price enquiry — Araye Modern website",
      l: { company: "Company", name: "Full name", email: "Email", phone: "Phone / WhatsApp", industry: "Target industry", service: "Requested service", material: "Material", quantity: "Quantity", delivery: "Delivery time", dimensions: "Dimensions", message: "Project details" } },
    ar: { ok: "تم استلام طلبك. سنرد عليك قريباً.", err: "فشل الإرسال. يرجى المحاولة مجدداً أو مراسلتنا على واتساب.", need: "يرجى تعبئة هذا الحقل.", email: "البريد الإلكتروني غير صالح.", phone: "رقم الهاتف غير صالح.", sending: "جارٍ الإرسال…",
      head: "طلب عرض سعر — موقع آرایه مدرن",
      l: { company: "اسم الشركة", name: "الاسم الكامل", email: "البريد الإلكتروني", phone: "الهاتف / واتساب", industry: "القطاع المستهدف", service: "الخدمة المطلوبة", material: "المادة", quantity: "الكمية", delivery: "مدة التسليم", dimensions: "الأبعاد", message: "تفاصيل المشروع" } }
  };

  function toast(form, msg, ok) {
    var box = form.parentNode.querySelector(".rfq-msg");
    if (!box) {
      box = document.createElement("div");
      box.setAttribute("role", "status");
      form.parentNode.insertBefore(box, form.nextSibling);
    }
    box.textContent = msg;
    box.className = "rfq-msg " + (ok ? "is-ok" : "is-err");
  }

  function digitsOnly(s) {
    var fa = "۰۱۲۳۴۵۶۷۸۹", ar = "٠١٢٣٤٥٦٧٨٩";
    return s.replace(/[۰-۹٠-٩]/g, function (ch) {
      var i = fa.indexOf(ch); if (i >= 0) return String(i);
      return String(ar.indexOf(ch));
    });
  }

  function val(el) { return el && el.value ? el.value.trim() : ""; }

  Array.prototype.forEach.call(document.querySelectorAll("form[data-rfq]"), function (form) {
    var t = T[form.getAttribute("data-lang") || "fa"] || T.fa;
    var btn = form.querySelector('button[type="submit"]');

    function validate() {
      var bad = null;
      Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (el) {
        if (bad || el.type === "hidden") return;
        if (el.type !== "file" && el.offsetParent === null) return;
        if (!val(el)) bad = el;
      });
      if (bad) { toast(form, t.need, false); bad.focus(); return false; }
      var em = form.querySelector('[name="email"]');
      if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val(em))) { toast(form, t.email, false); em.focus(); return false; }
      var ph = form.querySelector('[name="phone"]');
      if (ph && digitsOnly(val(ph)).replace(/[^0-9]/g, "").length < 8) { toast(form, t.phone, false); ph.focus(); return false; }
      return true;
    }

    // read the filled form into "label: value" lines
    function readForm() {
      var lines = [];
      Array.prototype.forEach.call(form.querySelectorAll("input,select,textarea"), function (el) {
        var k = el.getAttribute("name");
        if (!k || k === "_form_id" || k === "website" || k === "drawings") return;
        var v = val(el);
        if (!v) return;
        lines.push((t.l[k] || k) + ": " + v);
      });
      return lines;
    }

    function telegramText(lines) {
      var stamp = new Date().toLocaleString("fa-IR");
      return [t.head, "زمان: " + stamp, ""].concat(lines).join("\n");
    }

    function postTelegram(lines) {
      return fetch("https://api.telegram.org/bot" + TG_TOKEN + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TG_CHAT, text: telegramText(lines), disable_web_page_preview: true })
      }).then(function (r) { return r.ok ? "ok" : "fail"; })
        .catch(function () { return "fail"; });
    }

    form.addEventListener("submit", function (ev) {
      var hp = form.querySelector('[name="website"]');
      if (hp && val(hp)) { ev.preventDefault(); return; }
      if (!validate()) { ev.preventDefault(); return; }

      var files = form.querySelector('input[type="file"]');
      if (files && files.files && files.files.length) { toast(form, t.err, false); ev.preventDefault(); return; }

      ev.preventDefault();
      var lines = readForm();
      var label = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = t.sending; }

      // two independent deliveries; the visitor only sees success once both settle
      Promise.all([
        fetch(form.action, { method: "POST", body: new FormData(form) }).then(function (r) {
          if (!r.ok) throw new Error(r.status); return "ok";
        }).catch(function () { return "fail"; }),
        postTelegram(lines)
      ]).then(function (res) {
        var emailOk = res[0] === "ok", tgOk = res[1] === "ok";
        form.reset();
        if (emailOk && tgOk) toast(form, t.ok, true);
        else if (emailOk || tgOk) toast(form, t.ok, true);
        else toast(form, t.err, false);
      }).then(function () {
        if (btn) { btn.disabled = false; btn.innerHTML = label; }
      });
    });
  });
})();