
import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  doc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// =====================================
// إعدادات الأدمن
// =====================================

const ADMIN_UID = "A5T9wqWI84MM5ekYoXKU90s2SkF3";

const loginForm = document.getElementById("adminLoginForm");
const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const loginStatus = document.getElementById("loginStatus");
const requestsArea = document.getElementById("requestsArea");
const adminWelcome = document.getElementById("adminWelcome");
const logoutBtn = document.getElementById("logoutBtn");

const requestFilters = document.getElementById("requestFilters");

const enableNotificationsBtn = document.getElementById(
  "enableNotificationsBtn"
);

const notificationStatus = document.getElementById(
  "notificationStatus"
);

// =====================================
// بيانات الطلبات
// =====================================

let allRequests = [];
let activeFilter = "pending";

// =====================================
// رسائل WhatsApp
// =====================================

const ACCEPT_MESSAGE = (name) =>
`مرحباً ${name}،

يسعدني إبلاغك بأنه تمت الموافقة على طلب مشروعك لدى MK Portfolio.

يشرفني العمل معك، وسنتواصل معك لمناقشة التفاصيل والخطوات القادمة.

شكراً لثقتك بي.
Mohamed Khaled`;

const REJECT_MESSAGE = (name) =>
`مرحباً ${name}،

شكراً لثقتك واهتمامك بخدمات MK Portfolio.

بعد مراجعة طلب مشروعك، أعتذر عن عدم إمكانية قبول الطلب في الوقت الحالي.

أتمنى لك كل التوفيق، وأشكرك على تفهمك.

Mohamed Khaled`;

// =====================================
// التحقق من حالة الطلب
// =====================================

function getRequestStatus(request) {
  return ["pending", "accepted", "rejected"].includes(request.status)
    ? request.status
    : "pending";
}

const statusNames = {
  pending: "طلب جديد - قيد المراجعة",
  accepted: "تمت الموافقة",
  rejected: "تم الرفض"
};

// =====================================
// تحويل رقم الهاتف
// =====================================

function normalizeWhatsAppPhone(phone) {
  let number = String(phone || "").replace(/\D/g, "");

  // تحويل الرقم المصري المحلي إلى دولي
  if (number.startsWith("0")) {
    number = "20" + number.substring(1);
  }

  return number;
}

// =====================================
// فتح WhatsApp
// =====================================

function openWhatsApp(phone, message) {
  const number = normalizeWhatsAppPhone(phone);

  if (!number || number.length < 10 || number.length > 15) {
    alert("رقم هاتف العميل غير صالح أو غير متوفر.");
    return;
  }

  const url =
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
}

// =====================================
// تسجيل الدخول
// =====================================

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;

  loginStatus.textContent = "جاري تسجيل الدخول...";

  try {
    await signInWithEmailAndPassword(auth, email, password);

  } catch (error) {
    console.error(error);

    loginStatus.textContent =
      "فشل تسجيل الدخول. راجع البريد وكلمة المرور.";
  }
});

// =====================================
// متابعة تسجيل الدخول
// =====================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    loginCard.hidden = false;
    dashboard.hidden = true;
    return;
  }

  if (user.uid !== ADMIN_UID) {

    loginStatus.textContent =
      "هذا الحساب ليس لديه صلاحية الإدارة.";

    await signOut(auth);
    return;
  }

  loginCard.hidden = true;
  dashboard.hidden = false;

  adminWelcome.textContent =
    "مرحبًا بك في لوحة إدارة MK.";

  await loadRequests();
});

// =====================================
// تحميل الطلبات
// =====================================

async function loadRequests() {

  requestsArea.textContent = "جاري تحميل الطلبات...";

  try {

    const snapshot = await getDocs(
      collection(db, "projectRequests")
    );

    allRequests = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data()
    }));

    allRequests.sort((a, b) =>
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );

    renderRequests();

  } catch (error) {

    console.error("Loading requests error:", error);

    requestsArea.textContent =
      "تعذر تحميل الطلبات. تحقق من Firebase.";
  }
}

// =====================================
// تغيير القسم
// =====================================

requestFilters.addEventListener("click", (event) => {

  const button = event.target.closest("[data-filter]");

  if (!button) return;

  activeFilter = button.dataset.filter;

  requestFilters.querySelectorAll("[data-filter]").forEach((item) => {
    item.classList.toggle("active", item === button);
  });

  renderRequests();
});

// =====================================
// عرض الطلبات
// =====================================

function renderRequests() {

  requestsArea.replaceChildren();

  const counts = {
    pending: 0,
    accepted: 0,
    rejected: 0
  };

  allRequests.forEach((request) => {
    counts[getRequestStatus(request)]++;
  });

  requestFilters.querySelector(
    '[data-filter="pending"]'
  ).textContent = `الطلبات الجديدة (${counts.pending})`;

  requestFilters.querySelector(
    '[data-filter="accepted"]'
  ).textContent = `المقبولة (${counts.accepted})`;

  requestFilters.querySelector(
    '[data-filter="rejected"]'
  ).textContent = `المرفوضة (${counts.rejected})`;

  const filteredRequests = allRequests.filter(
    (request) => getRequestStatus(request) === activeFilter
  );

  if (filteredRequests.length === 0) {

    const empty = document.createElement("p");

    empty.className = "empty-requests";

    empty.textContent = {
      pending: "لا توجد طلبات جديدة حاليًا.",
      accepted: "لا توجد طلبات مقبولة.",
      rejected: "لا توجد طلبات مرفوضة."
    }[activeFilter];

    requestsArea.appendChild(empty);
    return;
  }

  filteredRequests.forEach((request) => {

    const card = document.createElement("article");

    card.className = "admin-card";

    const status = getRequestStatus(request);

    const clientName = request.clientName || "عميلنا العزيز";

    // اسم العميل

    const title = document.createElement("h3");

    title.textContent = clientName;

    card.appendChild(title);

    // حالة الطلب

    const statusBadge = document.createElement("span");

    statusBadge.className =
      `request-status status-${status}`;

    statusBadge.textContent = statusNames[status];

    card.appendChild(statusBadge);

    // تفاصيل الطلب

    const details = [
      `البريد الإلكتروني: ${request.email || "غير متوفر"}`,
      `نوع المشروع: ${request.projectType || "غير محدد"}`,
      `الميزانية: ${request.budget ?? "غير محددة"}`,
      `الموعد المتوقع: ${request.deadline || "غير محدد"}`,
      `الوصف: ${request.description || "لا يوجد وصف"}`,
      `تاريخ الإرسال: ${request.submittedAt || "غير متوفر"}`,
      `رقم الطلب: ${request.id}`
    ];

    details.forEach((detail) => {

      const paragraph = document.createElement("p");

      paragraph.textContent = detail;

      card.appendChild(paragraph);
    });

    // رقم الهاتف

    const phoneParagraph = document.createElement("p");

    const phoneLabel = document.createElement("span");

    phoneLabel.textContent = "رقم الهاتف: ";

    phoneParagraph.appendChild(phoneLabel);

    if (request.phone) {

      const phoneLink = document.createElement("a");

      phoneLink.textContent = request.phone;

      const safePhone = String(request.phone).replace(/[^\d+]/g, "");

      phoneLink.href = `tel:${safePhone}`;

      phoneParagraph.appendChild(phoneLink);

    } else {

      phoneParagraph.append("غير متوفر");
    }

    card.appendChild(phoneParagraph);

    // أزرار القرارات

    if (status === "pending") {

      const actions = document.createElement("div");

      actions.className = "request-actions";

      const acceptButton = createDecisionButton(
        "✓ قبول الطلب",
        "accept-btn",
        request,
        "accepted"
      );

      const rejectButton = createDecisionButton(
        "✕ رفض الطلب",
        "reject-btn",
        request,
        "rejected"
      );

      actions.appendChild(acceptButton);
      actions.appendChild(rejectButton);

      card.appendChild(actions);
    }

    // زر الحذف

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className = "admin-btn delete-btn";

    deleteButton.textContent = "حذف الطلب";

    deleteButton.style.marginTop = "15px";

    deleteButton.addEventListener("click", async () => {

      if (auth.currentUser?.uid !== ADMIN_UID) {
        alert("غير مسموح لك بتنفيذ هذا الإجراء.");
        return;
      }

      const confirmed = confirm(
        `هل تريد حذف طلب ${clientName} نهائيًا؟`
      );

      if (!confirmed) return;

      deleteButton.disabled = true;

      deleteButton.textContent = "جاري الحذف...";

      try {

        await deleteDoc(
          doc(db, "projectRequests", request.id)
        );

        allRequests = allRequests.filter(
          (item) => item.id !== request.id
        );

        renderRequests();

      } catch (error) {

        console.error("Delete error:", error);

        alert("تعذر حذف الطلب.");

        deleteButton.disabled = false;

        deleteButton.textContent = "حذف الطلب";
      }
    });

    card.appendChild(deleteButton);

    requestsArea.appendChild(card);
  });
}

// =====================================
// قبول ورفض الطلب
// =====================================

function createDecisionButton(text, className, request, decision) {

  const button = document.createElement("button");

  button.type = "button";

  button.className = `admin-btn ${className}`;

  button.textContent = text;

  button.addEventListener("click", async () => {

    if (auth.currentUser?.uid !== ADMIN_UID) {
      alert("غير مسموح لك بتنفيذ هذا الإجراء.");
      return;
    }

    if (!request.phone) {
      alert("رقم هاتف العميل غير متوفر.");
      return;
    }

    const confirmed = confirm(
      decision === "accepted"
        ? `هل تريد الموافقة على طلب ${request.clientName}؟`
        : `هل تريد رفض طلب ${request.clientName}؟`
    );

    if (!confirmed) return;

    const name = request.clientName || "عميلنا العزيز";

    const message = decision === "accepted"
      ? ACCEPT_MESSAGE(name)
      : REJECT_MESSAGE(name);

    const number = normalizeWhatsAppPhone(request.phone);

    if (number.length < 10 || number.length > 15) {
      alert("رقم الهاتف غير صالح.");
      return;
    }

    const whatsappURL =
      `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    // فتح النافذة مباشرة من ضغط المستخدم
    const whatsappWindow = window.open("about:blank", "_blank");

    if (!whatsappWindow) {
      alert("المتصفح منع فتح WhatsApp. اسمح بالنوافذ المنبثقة.");
      return;
    }

    button.disabled = true;

    button.textContent = "جاري تحديث الحالة...";

    try {

      // حفظ القرار في Firebase

      await updateDoc(
        doc(db, "projectRequests", request.id),
        {
          status: decision,
          decisionAt: serverTimestamp()
        }
      );

      // تحديث البيانات المحلية

      request.status = decision;

      // فتح محادثة العميل

      whatsappWindow.location.href = whatsappURL;

      // تحديث الأقسام والأعداد

      renderRequests();

    } catch (error) {

      console.error("Decision update error:", error);

      whatsappWindow.close();

      alert(
        "تعذر حفظ القرار في Firebase. لم يتم تغيير حالة الطلب."
      );

      button.disabled = false;

      button.textContent = text;
    }
  });

  return button;
}

// =====================================
// تسجيل الخروج
// =====================================

logoutBtn.addEventListener("click", async () => {

  try {
    await signOut(auth);

  } catch (error) {
    console.error("Logout error:", error);
    alert("تعذر تسجيل الخروج.");
  }
});

// =====================================
// OneSignal - Admin Notifications
// =====================================

let oneSignalInstance = null;

let oneSignalReady = false;

window.OneSignalDeferred = window.OneSignalDeferred || [];

window.OneSignalDeferred.push(async function (OneSignal) {

  try {

    await OneSignal.init({

      appId: "7ee15009-d37c-4e20-8ef9-323cfb12fe9f",

      serviceWorkerPath: "/moha-portofolio/OneSignalSDKWorker.js",

      serviceWorkerParam: {
        scope: "/moha-portofolio/"
      }

    });

    oneSignalInstance = OneSignal;

    oneSignalReady = true;

    if (auth.currentUser?.uid === ADMIN_UID) {
      await OneSignal.login(ADMIN_UID);
    }

  } catch (error) {

    console.error("OneSignal Error:", error);

    if (notificationStatus) {
      notificationStatus.textContent =
        "خطأ OneSignal: " + error.message;
    }
  }
});

// متابعة تسجيل دخول الأدمن في OneSignal

onAuthStateChanged(auth, async (user) => {

  if (!user || user.uid !== ADMIN_UID) return;

  try {

    if (oneSignalReady && oneSignalInstance) {
      await oneSignalInstance.login(ADMIN_UID);
    }

  } catch (error) {

    console.error("OneSignal Login Error:", error);
  }
});

// =====================================
// تفعيل الإشعارات
// =====================================

enableNotificationsBtn.addEventListener("click", async () => {

  if (!oneSignalReady || !oneSignalInstance) {

    notificationStatus.textContent =
      "خدمة الإشعارات لم تجهز بعد. حاول بعد قليل.";

    return;
  }

  try {

    await oneSignalInstance.Notifications.requestPermission();

    await oneSignalInstance.User.PushSubscription.optIn();

    notificationStatus.textContent =
      "تم طلب تفعيل الإشعارات. انتظر لحظة للتحقق من الاشتراك.";

  } catch (error) {

    console.error("Notification Error:", error);

    notificationStatus.textContent =
      "تعذر تفعيل الإشعارات. تحقق من إعدادات المتصفح.";
  }
});
