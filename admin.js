
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
  doc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// حساب الأدمن
const ADMIN_UID = "A5T9wqWI84MM5ekYoXKU90s2SkF3";

const loginForm = document.getElementById("adminLoginForm");
const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const loginStatus = document.getElementById("loginStatus");
const requestsArea = document.getElementById("requestsArea");
const adminWelcome = document.getElementById("adminWelcome");
const logoutBtn = document.getElementById("logoutBtn");

// =================================
// WhatsApp Decision Messages
// =================================

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

// تحويل رقم الهاتف إلى صيغة WhatsApp الدولية
function normalizeWhatsAppPhone(phone) {
  let number = String(phone || "").replace(/\D/g, "");

  // تحويل الرقم المصري المحلي إلى دولي
  if (number.startsWith("0")) {
    number = "20" + number.substring(1);
  }

  return number;
}

// فتح محادثة WhatsApp برسالة جاهزة
function openWhatsApp(phone, message) {
  const number = normalizeWhatsAppPhone(phone);

  if (!number || number.length < 10 || number.length > 15) {
    alert("رقم هاتف العميل غير صالح أو غير متوفر.");
    return;
  }

  const whatsappURL =
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  window.open(whatsappURL, "_blank");
}

// إنشاء زر قرار
function createDecisionButton(text, color, phone, message) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "admin-btn";
  button.textContent = text;

  button.style.background = color;
  button.style.marginTop = "12px";
  button.style.marginLeft = "8px";

  button.addEventListener("click", () => {
    if (auth.currentUser?.uid !== ADMIN_UID) {
      alert("غير مسموح لك بتنفيذ هذا الإجراء.");
      return;
    }

    if (!phone) {
      alert("لا يوجد رقم هاتف لهذا العميل.");
      return;
    }

    openWhatsApp(phone, message);
  });

  return button;
}

// =================================
// تسجيل الدخول
// =================================

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

// =================================
// متابعة تسجيل الدخول
// =================================

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

// =================================
// جلب طلبات المشاريع
// =================================

async function loadRequests() {
  requestsArea.textContent = "جاري تحميل الطلبات...";

  try {
    const snapshot = await getDocs(
      collection(db, "projectRequests")
    );

    if (snapshot.empty) {
      requestsArea.textContent = "لا توجد طلبات حتى الآن.";
      return;
    }

    const requests = snapshot.docs.map((requestDoc) => ({
      id: requestDoc.id,
      ...requestDoc.data()
    }));

    requests.sort((a, b) =>
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );

    requestsArea.replaceChildren();

    requests.forEach((request) => {
      const card = document.createElement("article");
      card.className = "admin-card";

      const title = document.createElement("h3");
      title.textContent = request.clientName || "بدون اسم";

      card.appendChild(title);

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
        const phoneText = document.createElement("span");
        phoneText.textContent = "غير متوفر";
        phoneParagraph.appendChild(phoneText);
      }

      card.appendChild(phoneParagraph);

      // =================================
      // أزرار قبول ورفض الطلب عبر WhatsApp
      // =================================

      const clientName = request.clientName || "عميلنا العزيز";

      const acceptButton = createDecisionButton(
        "✓ قبول الطلب",
        "#16803c",
        request.phone,
        ACCEPT_MESSAGE(clientName)
      );

      const rejectButton = createDecisionButton(
        "✕ رفض الطلب",
        "#b42318",
        request.phone,
        REJECT_MESSAGE(clientName)
      );

      card.appendChild(acceptButton);
      card.appendChild(rejectButton);

      // =================================
      // حذف الطلب
      // =================================

      const deleteButton = document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className = "admin-btn";
      deleteButton.textContent = "تم التنفيذ وحذف الطلب";

      deleteButton.style.background = "#b42318";
      deleteButton.style.marginTop = "12px";

      deleteButton.addEventListener("click", async () => {
        if (auth.currentUser?.uid !== ADMIN_UID) {
          alert("غير مسموح لك بتنفيذ هذا الإجراء.");
          return;
        }

        const confirmed = confirm(
          `هل انتهيت من طلب ${request.clientName || "هذا العميل"} وتريد حذفه نهائيًا؟`
        );

        if (!confirmed) return;

        deleteButton.disabled = true;
        deleteButton.textContent = "جاري الحذف...";

        try {
          await deleteDoc(
            doc(db, "projectRequests", request.id)
          );

          card.remove();

          if (!requestsArea.querySelector(".admin-card")) {
            requestsArea.textContent = "لا توجد طلبات حتى الآن.";
          }

        } catch (error) {
          console.error("Delete request error:", error);

          alert("تعذر حذف الطلب. تحقق من صلاحيات Firestore واتصال الإنترنت.");

          deleteButton.disabled = false;
          deleteButton.textContent = "تم التنفيذ وحذف الطلب";
        }
      });

      card.appendChild(deleteButton);
      requestsArea.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading requests:", error);

    requestsArea.textContent =
      "تعذر تحميل الطلبات. تحقق من اتصال Firebase وقواعد Firestore.";
  }
}

// =================================
// تسجيل الخروج
// =================================

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// =================================
// OneSignal - Admin Notifications
// =================================

const enableNotificationsBtn = document.getElementById(
  "enableNotificationsBtn"
);

const notificationStatus = document.getElementById(
  "notificationStatus"
);

let oneSignalInstance = null;
let oneSignalReady = false;

// تهيئة OneSignal
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

// متابعة تسجيل دخول الأدمن
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

// زر تفعيل الإشعارات
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
