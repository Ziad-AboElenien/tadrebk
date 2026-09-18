# متطلبات الباك-إند — مسح شامل للمشروع

> هذا الملف يجمع **كل** الشاشات المنفذة في الفرونت وتنتظر الباك-إند، ثم اللينكات
> الموجودة التي تحتاج تعديلًا. الـ envelope المتبع في المشروع:
> `{ data: {...}, msg: "..." }` مع pagination بشكل `{ page, limit, total, pages }`.
>
> ملحوظة: ملف `live_swagger.json` في جذر المشروع حاليًا صفحة stub من شركة
> الاستضافة وليس الـ spec الحقيقي — برجاء إعادة تصديره بعد أي تغيير.

---

# القسم الأول: لينكات ناقصة تمامًا (UI جاهز ومنتظر الباك)

## 1. تجميع تقييمات الشركة — `GET /company/:id/ratings` ⬅ أولوية عالية
- **فين في الفرونت:** صفحة الشركة للطالب (`/companies/[companyId]`) وصفحة الشركة
  لنفسها (`/company/profile`) — قسم النجوم + توزيع التقييمات + آراء الطلاب.
- **الحالي:** قيم ثابتة في الكود (`SAMPLE_RATING_*` في
  `CompanyProfileViewer.tsx` و`CompanyProfileOwn.tsx`).
- **المطلوب:** endpoint تجميعي واحد (التقييمات الفردية موجودة لكن per-application فقط):
```json
GET /company/60d0fe4f5311236168a109cb/ratings
{
  "data": {
    "avg": 4.6,
    "count": 37,
    "histogram": [
      { "stars": 5, "pct": 72 },
      { "stars": 4, "pct": 19 },
      { "stars": 3, "pct": 6 },
      { "stars": 2, "pct": 2 },
      { "stars": 1, "pct": 1 }
    ],
    "reviews": [
      { "student": "Sara M.", "track": "UI/UX Design", "rating": 5, "date": "2026-08-12", "body": "…" }
    ]
  },
  "msg": "ok"
}
```
- **التفاصيل المطلوبة:**
  - `avg`: متوسط كل تقييمات الطلاب للشركة (`companyRating` من `GET /application/:id/ratings` للتقديمات المكتملة الخاصة بالشركة).
  - `count`: عدد التقييمات.
  - `histogram`: توزيع النجوم بالنسب المئوية (مجموعها 100).
  - `reviews`: أحدث 3–5 آراء نصية (اسم أول + أول حرف من العائلة كافٍ للخصوصية)، مع الـ track والتاريخ.
  - يُحسب من التقديمات الـ `completed` فقط حتى لا تُحسب تقييمات تقديمات ملغية.

## 2. مسح كورس — `DELETE /user/courses/:index` ⬅ أولوية عالية
- **فين:** تعديل البروفايل (Settings ← Edit Profile ← Courses).
- **الحالي:** يوجد `POST /user/courses` و`PATCH /user/courses/:index` فقط — **لا توجد
  طريقة لمسح كورس**، لذلك زر المسح غير موجود أصلًا في الـ UI.
- **المطلوب:**
```
DELETE /user/:userId/courses/:index → 204 (أو 200 مع { msg })
```

## 3. محرك النقاط (Points Rules Engine) — مجموعة لينكات ⬅ أولوية متوسطة
- **فين:** صفحة Points Configuration (`/company/admin/points`) — **الشاشة كلها
  static بقيم ثابتة** (12 rule وهمية، إحصائيات وهمية، زر New Rule لا يفعل شيئًا).
- **المطلوب:**
```
GET    /company/:id/points/rules   → { data: { rules: [{ _id, title, category, points, frequency, status }] } }
POST   /company/:id/points/rules   → { title, category, points, frequency } → 201
PATCH  /company/:id/points/rules/:ruleId → { title?, points?, frequency?, status? }
DELETE /company/:id/points/rules/:ruleId → 204
GET    /company/:id/points/stats   → { data: { activeRules, avgPointsPerMonth, totalRedemptions, systemHealth } }
GET    /company/:id/points/milestones → { data: { milestones: [{ _id, title, threshold, reward }] } }
POST   /company/:id/points/milestones (إنشاء milestone)
```
- **التفاصيل:** الـ `category` من: `attendance | tasks | performance | community`،
  والـ `frequency` من: `daily | weekly | per_task | one_time`، والـ `status`:
  `active | inactive`. إحصائيات الصفحة تُشتق من نفس البيانات.

## 4. دعوة مرشح لإنترن — `POST .../invites` ⬅ أولوية متوسطة
- **فين:** بروفايل المرشح للشركة (`/company/admin/candidates/[userId]`) — زر
  "Invite to internship" يعرض toast فقط لعدم وجود API.
- **المطلوب:**
```
POST /company/:companyId/internships/:internId/invites
Body: { "studentId": "…" }
→ 201 { data: { invite: { _id, status: "pending", createdAt } } }
```
- **اختياري لاحقًا:** `GET` لدعوات الطالب + قبول/رفض من جهته.

## 5. حفظ الشركات (Save company) — لينكات ⬅ أولوية متوسطة
- **فين:** صفحة الشركة للطالب (زر Save company) — حاليًا حالة محلية فقط تضيع مع
  التحديث. (حفظ **التدريبات** موجود: `/internships/saved` ✅).
- **المطلوب بنفس نمط التدريبات:**
```
POST   /companies/:id/save   → 201
DELETE /companies/:id/save   → 204
GET    /companies/saved?page=&limit= → { data: { companies: [...], pagination } }
```

## 6. فورم التواصل — `POST /contact` ⬅ أولوية متوسطة
- **فين:** صفحة `/contact` — الفورم يعرض toast نجاح وهمي ولا يرسل شيئًا.
- **المطلوب:**
```
POST /contact
Body: { "name": "John Doe", "email": "you@example.com", "subject?": "…", "message": "…" }
→ 201 { msg: "Message received" }
```

## 7. النشرة البريدية — `POST /newsletter/subscribe` ⬅ أولوية منخفضة
- **فين:** فوتر الموقع (حقل الإيميل + زر Subscribe) — الزر **بدون أي handler**.
- **المطلوب:**
```
POST /newsletter/subscribe
Body: { "email": "you@example.com" } → 201 { msg: "Subscribed" }
```

## 8. الإبلاغ عن محتوى — `POST /reports` ⬅ أولوية منخفضة
- **فين:** "Report this company" و"Report profile" — حاليًا toast إعلامي فقط.
- **المطلوب:**
```
POST /reports
Body: { "targetType": "company" | "user" | "internship", "targetId": "…", "reason": "…" }
→ 201 { msg: "Report received" }
```

## 9. عدّادات الأقسام في الهوم ⬅ أولوية منخفضة
- **فين:** قسم Browse by Category (أرقام ثابتة: 42، 28، 19…) — مضللة لو تغيرت البيانات.
- **المطلوب (أحد حلين):** إما `GET /internships/stats/by-category →
  { data: { counts: { software: 42, marketing: 28, … } } }`، أو نحذف الأرقام من
  الـ UI (الحل البديل من جهتي لو تأخر الباك).

## 10. المراسلة داخل المنصة (مستقبلية)
- **فين:** تاب Messages في داشبورد الطالب — يعرض "coming soon" بتصميم نهائي.
- **المطلوب عند الجاهزية (تصور مبدئي):**
```
GET  /conversations?companyId=&studentId= → { data: { conversations: [{ _id, peer, lastMessage, unread }] } }
GET  /conversations/:id/messages?before=  → { data: { messages: [{ _id, senderId, body, createdAt }] } }
POST /conversations/:id/messages → { body } → 201
```

## 11. توثيق الشهادات برابط عام (اختياري)
- **فين:** صفحة `/certificate` — تُبنى client-side من بيانات التدريب، بدون توثيق.
- **المطلوب (اختياري):** `GET /certificates/:code → { data: { valid, student, internship, company, completedAt } }`
  لصفحة تحقق عامة ضد التزوير.

## 12. الحضور اليومي للطالب (gamification — اختياري)
- **فين:** داشبورد الطالب (streak check-in) — يعمل بالكامل بـ localStorage.
- **المطلوب (اختياري، ليس عاجلًا):**
```
POST /user/:id/checkin → { data: { streak, last } }
GET  /user/:id/checkin → { data: { streak, last } }
```

---

# القسم الثاني: لينكات موجودة تحتاج تعديلًا

## أ. `PATCH /user/:id` — حقول ناقصة ⬅ أولوية عالية
الفرونت يحفظ الحقول التالية في localStorage (ملف
`features/profiles/services/profile-meta.store.ts`) لانعدام دعمها:

**أ1. المهارات كـ objects (بدل `string[]` فقط):**
- **الحالي:** `"skills": ["React", "Excel"]`
- **المطلوب (متوافق رجعيًا — يقبل الشكلين):**
```json
{ "skills": [
  { "name": "React", "source": "internship", "sourceRef": "Frontend Internship @ TechFlow", "description": "Built 3 production apps…" },
  "Excel"
]}
```
- `source`: `"self" | "education" | "internship" | "other"` (إجباري مع الـ object)
- `sourceRef`: اسم المؤسسة التعليمية/التدريب، أو نص حر عند `other`
- `description`: وصف اختياري للمهارة
- `GET /user/:id` يرجع نفس الشكل المخصب.

**أ2. وصف التعليم:**
- **الحالي:** عناصر `education[]` بدون وصف.
- **المطلوب:** إضافة `description?: string` لكل عنصر (قبولًا وإرجاعًا).

**أ3. السوشيال ميديا:**
- **الحالي:** لا يوجد.
- **المطلوب:**
```json
{ "socials": [{ "platform": "LinkedIn", "url": "https://…" }] }
```
قبولًا وإرجاعًا في `GET /user/:id` (روابط علنية ينشرها المستخدم بنفسه).

## ب. كورسات الطالب — `POST /user/courses` و`PATCH /user/courses/:index` ⬅ أولوية عالية
- **الحالي:** يقبلان `{ name, file }` فقط.
- **المطلوب:** قبول وإرجاع الحقول التالية مع كل كورس:
```json
{ "name": "Advanced Node.js", "startDate": "2025-09", "endDate": null, "present": true, "description": "…" }
```
- `present: true` تعني "مستمر حتى الآن" وتتجاهل `endDate`.

## ج. `GET /user/:id` للشركات ⬅ تأكيد صلاحية
- بروفايل المرشح للشركة يعتمد عليه — **يعمل اليوم** ✅. المطلوب فقط: الإبقاء على
  السماح للشركات بقراءة البروفايل العام للطالب + إرجاع الحقول الجديدة أعلاه
  (بدون بيانات حساسة إضافية).

## د. `PATCH /company/:id` — حقول إثراء البروفايل ⬅ أولوية متوسطة
- **الحالي (UpdateCompanyPayload):** `name, description, industry, address,
  location, numberOfEmployees, companyEmail, logo, coverPicture`.
- **المطلوب إضافتها (قبولًا وإرجاعًا في GET):**
```json
{ "website": "https://techflow.io", "linkedin": "https://linkedin.com/company/…", "headline": "Building payment infra for MENA", "foundedYear": 2018 }
```
بدونها صفحة الشركة تعرض الصناعة والحجم والعنوان فقط.

## هـ. `GET /internships` — عدّادات وتوحيد ⬅ أولوية متوسطة
1. ** Applicants count:** صفحة الشركة Own تجلب عدد المتقدمين بـ N طلب
   (`GET /company/:id/internships/:internId/applications?limit=1` لكل منشور).
   **المطلوب:** حقل `applicantsCount` (واختياريًا `openPositions`) داخل كل عنصر في
   القائمة — يلغي الـ N+1.
2. **`closed` موثوق:** الفرونت يعكس حالة الإغلاق في localStorage كاحتياط
   (`closedInternshipState.ts`) — برجاء ضمان أن القائمة ترجع `closed` النهائي
   دائمًا بعد `close/reopen` حتى يُحذف الـ workaround.

## و. رفع التقييمات (Evaluations) على السيرفر ⬅ تحقق عاجل
- الفرونت يستدعي (موجودة بالكود):
```
GET/PATCH /company/:id/evaluations
GET       /company/:id/evaluations/:evaluationId
POST      /company/:id/evaluations
PATCH     /company/:id/evaluations/:evaluationId/share
GET       /company/:id/evaluations/dashboard
GET       /company/:id/evaluations/alerts
```
- الشاشة تعرض رسالة "Evaluations are not available on the server yet" عند الفشل —
  **برجاء تأكيد نشر هذه اللينكات على السيرفر** (الكود جاهز من جهتي).

## ز. الحضور — تفعيل الـ single-mark ⬅ تحقق
- `POST /company/:companyId/interns/:internId/attendance` **يرجع 404** رغم توثيقه —
  الفرونت يلتف عبر `bulk-mark` بصف واحد (يعمل ✅).
- **المطلوب:** إما نشر الـ single-mark route، أو التأكيد الرسمي أن bulk-only هو
  التعاقد النهائي (الكود موثق بذلك وسأبقيه).

## ح. التحقق من الشركات — توضيح دلالي ⬅ سؤال
- لا يوجد `isVerified` — الفرونت يترجم `approvedByAdmin → شارة Verified`.
- **المطلوب:** تأكيد أن هذا التعيين مقصود، أو اقتراح حقل منفصل
  (`verificationStatus: pending|verified|rejected`) إن كانت الموافقة الإدارية
  والتوثيق العلني شيئين مختلفين.

## ط. سقف الـ 100 في قوائم الشركة
- `GET /company/:id/interns` (وغالبًا القوائم الأخرى) بسقف 100 — الفرونت يمشي
  الصفحات تلقائيًا (`listAllInterns`). لا مشكلة حاليًا؛ يُفضل الإبقاء أو رفعه،
  المهم عدم تخفيضه.

---

# يعمل اليوم ولا يحتاج شيئًا ✅
(للتوثيق حتى لا يُعاد فتحه)
- Auth كاملًا: signup/login/OTP/Google، تغيير الباسورد والإيميل.
- التدريبات: CRUD + إغلاق/فتح + حفظ الطالب (`/internships/saved`) + التقديم + مراجعة
  الطلبات + إكمال + إيميل القبول + التقييم per-application.
- الإشعارات: list/unread-count/read-all/read ✅.
- Intern/me للطالب: enrollments/program/supervisor/evaluations ✅.
- Tasks/Programs/Projects/Broadcasts/Attendance(bulk+schedule)/Interns ✅.
- الرفع: صور الطالب/الشركة، CV، شهادات الكورسات، المرفق القانوني ✅.
- حذف حساب الطالب ✅.
