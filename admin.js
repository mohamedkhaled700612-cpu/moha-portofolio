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

// حساب الأدمن المسموح له بالدخول
const ADMIN_UID = "A5T9wqWI84MM5ekYoXKU90s2SkF3";

const loginForm = document.getElementById("adminLoginForm");
const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const loginStatus = document.getElementById("loginStatus");
const requestsArea = document.getElementById("requestsArea");
const adminWelcome = document.getElementById("adminWelcome");
const logoutBtn = document.getElementById("logoutBtn");

// تسجيل الدخول
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

// متابعة حالة تسجيل الدخول
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

// جلب طلبات المشاريع
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

      // رقم الهاتف مع إمكانية الاتصال
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

      // زر إنهاء الطلب وحذفه
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

// تسجيل الخروج
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// ===============================
// OneSignal - Admin Notifications
// ===============================

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
