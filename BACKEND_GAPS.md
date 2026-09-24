# متطلبات الباك-إند — مسح شامل للمشروع

> ## ✅ تحديث 2026-09-19 — الباك سلّم P0–P2 والفرونت اتوصل
> البنود 1–5 و7–12 من الأسفل أصبحت **مُسلَّمة من الباك وموصولة في الفرونت**.
> الباقي المعلق: P3 (تواصل/نشرة/إبلاغ/عدّادات) وP5 (مؤجل). الـ spec الحي:
> `GET https://tadreebak-e285.onbelmo.uk/api/v1/docs/swagger.json` (102 مسار) —
> منسوخ محليًا في `live_swagger.json`.
>
> ## ✅ تحديث 2026-09-24 — الباك سلّم P3 وP5 (#11 تحقق الشهادات، #12 تشيك-إن)
> الـ spec الحي أصبح **108 مسارات** (`live_swagger.json` محدّث من السيرفر).
> الفرونت توصّل بكل الجديد: فورم التواصل (`POST /contact`)، النشرة
> (`POST /newsletter/subscribe`)، الإبلاغ (`POST /reports` مع مودال سبب)،
> عدّادات الأقسام (`GET /internships/stats/by-category`)، التحقق العلني من
> الشهادات (`GET /certificates/:code` عبر `?code=` في `/certificate`)،
> التشيك-إن (`GET/POST /user/:id/checkin` مع fallback محلي)، والـ single-mark
> للحضور (محاولة أولًا ثم fallback على bulk-mark).
> المتبقي من الباك: **#10 المراسلة (مؤجل حسب الـ spec)** + أسئلة دلالية
> (ح، ط) + تأكيد إغلاق البنود أ، ب، ج، د، هـ، و، ز (كلها تعمل اليوم).
>
> الـ envelope المتبع: `{ data: {...}, msg: "..." }` مع pagination بشكل
> `{ page, limit, total, pages }`.

---

# القسم الأول: لينكات ناقصة تمامًا (UI جاهز ومنتظر الباك)

## 0. رفع مرفق مع تسليم التاسك (الطالب) — `POST /intern/me/:companyId/tasks/:taskId/attachments` ⬅ أولوية عالية
- **فين في الفرونت:** مودال السبميت (`SubmitTaskModal.tsx`) + صفحة دييتيلز التاسك
  للطالب — الـ file picker موجود وشغال UI، لكن الملف **لا يُرسل** لانعدام endpoint.
- **الحالي:** `POST .../submit` يقبل `{ note }` فقط (الملف المختار يُتجاهل).
- **المطلوب (multipart/form-data):**
```
POST /intern/me/:companyId/tasks/:taskId/attachments
Body (multipart): file (≤ 10MB: pdf/jpg/png/docx/zip)
→ 201 { data: { attachment: { public_id, secure_url, name, mimeType, size } } }
```
- البديل المقبول: قبول `attachments` ضمن `POST .../submit` نفسه كـ multipart.
- الفورنت سيُرسل الملف فور توفر اللينك (الكود جاهز، ينقصه سطر الإرسال فقط).

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

## 6. فورم التواصل — `POST /contact` ✅ مُسلَّم وموصول
- **فين:** صفحة `/contact` — الفورم يرسل `{ name, email, message }` للباك مباشرة
  (`ContactForm.tsx`).
- ~~يعرض toast نجاح وهمي ولا يرسل شيئًا~~ — اتوصل 2026-09-24.

## 7. النشرة البريدية — `POST /newsletter/subscribe` ✅ مُسلَّمة وموصولة
- **فين:** فوتر الموقع — الزر يرسل `{ email }` ويعرض تأكيد (`Footer.tsx`).
- ~~بدون أي handler~~ — اتوصل 2026-09-24.

## 8. الإبلاغ عن محتوى — `POST /reports` ✅ مُسلَّم وموصول
- **فين:** "Report this company" (`CompanyProfileViewer.tsx`) و"Report profile"
  (`StudentProfileViewer.tsx`) — مودال مشترك (`ReportModal.tsx`) يجمع `reason`
  (≥ 5 أحرف) ويرسل `{ targetType, targetId, reason }`.
- ~~toast إعلامي فقط~~ — اتوصل 2026-09-24.

## 9. عدّادات الأقسام في الهوم ✅ مُسلَّمة وموصولة
- **فين:** قسم Browse by Category — يجلب `GET /internships/stats/by-category`
  ويجمع الـ tracks المرتبطة بكل كارت (`CategoriesSection.jsx`)، مع fallback
  للأرقام الثابتة عند غياب المفتاح أو فشل الطلب.
- ~~أرقام ثابتة~~ — اتوصل 2026-09-24.

## 10. المراسلة داخل المنصة (مستقبلية)
- **فين:** تاب Messages في داشبورد الطالب — يعرض "coming soon" بتصميم نهائي.
- **المطلوب عند الجاهزية (تصور مبدئي):**
```
GET  /conversations?companyId=&studentId= → { data: { conversations: [{ _id, peer, lastMessage, unread }] } }
GET  /conversations/:id/messages?before=  → { data: { messages: [{ _id, senderId, body, createdAt }] } }
POST /conversations/:id/messages → { body } → 201
```

## 11. توثيق الشهادات برابط عام ✅ مُسلَّم وموصول
- **فين:** صفحة `/certificate?code=…` — وضع التحقق العلني (`CertificateVerify`)
  يستدعي `GET /certificates/:code` ويعرض (اسم أول + أول حرف، التدريب، الشركة،
  التاريخ) أو رسالة "not verified". الوضع القديم (`?name=&internshipId=`) كما هو.
- ~~بدون توثيق~~ — اتوصل 2026-09-24.

## 12. الحضور اليومي للطالب ✅ مُسلَّم وموصول
- **فين:** داشبورد الطالب — التشيك-إن يقرأ/يكتب `GET/POST /user/:id/checkin`
  (`checkin.service.ts`) مع fallback على localStorage عند غياب الجلسة أو فشل
  الشبكة. نص "tracked on this device" اتشال.
- ~~يعمل بالكامل بـ localStorage~~ — اتوصل 2026-09-24.

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

## ز. الحضور — الـ single-mark ✅ مُسلَّم وموصول (مع fallback)
- `POST /company/:companyId/interns/:internId/attendance` يعمل اليوم —
  `markAttendance` تحاوله أولًا، وعند 404 فقط تلتف عبر `bulk-mark` بصف واحد.
- ~~يرجع 404 رغم توثيقه~~ — اتوصل 2026-09-24 (الـ fallback باقٍ للأمان).

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
