# AGENTS.md — تادربك (tadrebk)

## القاعدة الذهبية للباك-اند
- **المصدر الوحيد والمُعتمد للـ backend API هو ملف `live_swagger.json`** الموجود في جذر المشروع (جرّبناه وجاء من لينك الـ Swagger الحي).
- **لا تنظُر إلى أي وثائق أخرى داخل المشروع** (docs/، CLAUDE.md، README، أي md قديم) لحسم شكل الباك-اند أو أسماء الـ endpoints أو الـ payloads.
- اگر التزمت منها أي endpoint، اعتمد على `live_swagger.json` بالضبط: المسار، الـ method، الـ params، الـ request body، الـ response schema.

## اللينك المرجعي للباك-اند الحي
- ضع لينك الـ Swagger الحي هنا (إذا وُصّل للمستخدم لاحقًا أكمله):

```
BACKEND_SWAGGER_URL = <لم يُوضع بعد>
```

## سياق المشروع بسرعة
- فول ستاك: Next.js App Router (فرونت) + Node/Express (باك) داخل المشروع نفسه.
- الـ admin screens: `src/features/company/screens/admin/*`
- الـ attendance screen اللي بينتظر الباك يزوّد الـ endpoints: شغال على الـ roster الحقيقي (interns + programs) وتوقيع الحضور بيتم inline من غير API، وبيتحول لـ API الحقيقي لما الباك يضيفه.
