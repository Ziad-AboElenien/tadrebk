export default function Internships() {
  return (
    <>
      {/* Main Wrapper */}
      <div class="max-w-6xl mx-auto px-6 py-8">
        {/* Breadcrumbs Section */}
        <nav class="flex items-center gap-2 text-[13px] font-medium text-gray-400 mb-8">
        <a href="#" class="hover:text-[#10b981] transition">Internships</a>
        <i class="fa-solid fa-chevron-right text-[10px]"></i>
        <span class="text-gray-600">Software Engineering Intern (Frontend focus)</span>
    </nav>

    <section class="bg-white rounded-4xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex flex-col md:flex-row items-center gap-6">
                <div class="w-24 h-24 rounded-full bg-linear-to-tr from-yellow-200 via-pink-200 to-blue-300 shadow-inner shrink-0"></div>
                
                <div class="text-center md:text-left">
                    <h1 class="text-3xl font-bold tracking-tight mb-2">Software Engineering Intern <br /> (Frontend focus)</h1>
                    <div class="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 text-[13px] mb-4 font-medium">
                        <span class="flex items-center gap-1.5"><i class="fa-solid fa-building text-emerald-500"></i> Swvl</span>
                        <span class="flex items-center gap-1.5"><i class="fa-solid fa-location-dot text-emerald-500"></i> Maadi, Cairo (Hybrid)</span>
                        <span class="flex items-center gap-1.5"><i class="fa-regular fa-calendar text-emerald-500"></i> Posted 2 days ago</span>
                    </div>
                    <div class="flex flex-wrap justify-center md:justify-start gap-2">
                        <span class="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full border border-emerald-100">PAID</span>
                        <span class="px-4 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">REMOTE FRIENDLY</span>
                        <span class="px-4 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">3 MONTHS</span>
                    </div>
                </div>
            </div>

            <div class="flex gap-3 w-full md:w-auto shrink-0">
                <button class="flex-1 md:flex-none border border-gray-200 px-6 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
                    <i class="fa-regular fa-bookmark"></i> Save
                </button>
                <button class="flex-2 md:flex-none bg-[#2ecc71] hover:bg-[#27ae60] text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition flex items-center justify-center gap-2">
                    Apply Now <i class="fa-solid fa-arrow-right text-sm"></i>
                </button>
            </div>
        </section>
      {/* هنا بتبدأ الـ Main Content Grid اللي فيها الـ Overview والـ Quick Facts */}
      </div>

      {/* Wrapper Center Container */}
      <div class="max-w-6xl mx-auto px-8 pb-32">

        {/* Main Content Grid */}
        <main class="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start mt-16">
        
        {/* Left Column: Main Information Container */}
        <div class="lg:col-span-2 bg-white rounded-4xl shadow-md border border-gray-100 overflow-hidden">
            <div class="p-14 space-y-16">
                
                {/* 1. Overview Section */}
                <section>
                    <h2 class="text-3xl font-black mb-10 flex items-center gap-5 text-[#1a2e35]">
                        <span class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <i class="fa-solid fa-circle-info text-2xl"></i>
                        </span> 
                        Overview
                    </h2>
                    <p class="text-gray-500 leading-relaxed font-bold text-[19px] pl-2">
                        Swvl is looking for a passionate Frontend Engineering Intern to join our dynamic team in Cairo. You will work closely with senior engineers to build and maintain high-quality web applications using modern technologies like React and TypeScript. This is a unique opportunity to experience a high-growth scale-up environment and contribute to products used by millions of people across the globe.
                    </p>
                </section>

                <hr class="border-gray-100/50" />

                {/* 2. Responsibilities Section */}
                <section>
                    <h2 class="text-3xl font-black mb-12 flex items-center gap-5 text-[#1a2e35]">
                        <span class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <i class="fa-solid fa-briefcase text-xl"></i>
                        </span> 
                        Responsibilities
                    </h2>
                    <ul class="space-y-10 pl-2">
                        <li class="flex items-start gap-6 text-gray-500 font-bold text-[18px]">
                            <span class="w-3 h-3 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-md"></span>
                            <span>Collaborate with the UI/UX design team to translate mockups into functional web interfaces.</span>
                        </li>
                        <li class="flex items-start gap-6 text-gray-500 font-bold text-[18px]">
                            <span class="w-3 h-3 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-md"></span>
                            <span>Write clean, maintainable, and well-documented React code.</span>
                        </li>
                        <li class="flex items-start gap-6 text-gray-500 font-bold text-[18px]">
                            <span class="w-3 h-3 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-md"></span>
                            <span>Participate in code reviews and learn best practices in software development.</span>
                        </li>
                        <li class="flex items-start gap-6 text-gray-500 font-bold text-[18px]">
                            <span class="w-3 h-3 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-md"></span>
                            <span>Identify and troubleshoot UI issues and performance bottlenecks.</span>
                        </li>
                    </ul>
                </section>

                <hr class="border-gray-100/50" />

                {/* 3. Requirements Section */}
                <section>
                    <h2 class="text-3xl font-black mb-12 flex items-center gap-5 text-[#1a2e35]">
                        <span class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <i class="fa-solid fa-circle-check text-2xl"></i>
                        </span> 
                        Requirements
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pl-2">
                        {/* Card Requirement */}
                        <div class="bg-[#f9fafb] p-8 rounded-4xl border border-gray-100 flex items-start gap-5 hover:bg-white hover:shadow-xl transition-all duration-300">
                            <i class="fa-solid fa-check text-emerald-500 mt-1 text-2xl"></i>
                            <p class="text-[15px] font-black text-slate-700 leading-snug">Currently pursuing a Bachelor's degree in Computer Science or a related technical field.</p>
                        </div>
                        <div class="bg-[#f9fafb] p-8 rounded-4xl border border-gray-100 flex items-start gap-5 hover:bg-white hover:shadow-xl transition-all duration-300">
                            <i class="fa-solid fa-check text-emerald-500 mt-1 text-2xl"></i>
                            <p class="text-[15px] font-black text-slate-700 leading-snug">Solid understanding of HTML5, CSS3, and modern JavaScript (ES6+).</p>
                        </div>
                        <div class="bg-[#f9fafb] p-8 rounded-4xl border border-gray-100 flex items-start gap-5 hover:bg-white hover:shadow-xl transition-all duration-300">
                            <i class="fa-solid fa-check text-emerald-500 mt-1 text-2xl"></i>
                            <p class="text-[15px] font-black text-slate-700 leading-snug">Familiarity with React.js and its core principles.</p>
                        </div>

                        <div class="bg-[#f9fafb] p-8 rounded-4xl border border-gray-100 flex items-start gap-5 hover:bg-white hover:shadow-xl transition-all duration-300">
                            <i class="fa-solid fa-check text-emerald-500 mt-1 text-2xl"></i>
                            <p class="text-[15px] font-black text-slate-700 leading-snug">Basic understanding of Git version control.</p>
                        </div>

                        <div class="bg-[#f9fafb] p-8 rounded-4xl border border-gray-100 flex items-start gap-5 hover:bg-white hover:shadow-xl transition-all duration-300">
                            <i class="fa-solid fa-check text-emerald-500 mt-1 text-2xl"></i>
                            <p class="text-[15px] font-black text-slate-700 leading-snug">Excellent problem-solving and communication skills.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside class="flex flex-col gap-10">
            {/* Quick Facts Card */}
            <div class="bg-white rounded-4xl p-10 shadow-md border border-gray-100">
                <h2 class="text-2xl font-black mb-12 flex items-center gap-4 text-[#1a2e35]">
                    <span class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                        <i class="fa-solid fa-bolt text-lg"></i>
                    </span> 
                    Quick Facts
                </h2>
                <div class="space-y-10">
                    <div class="flex items-center gap-6 group">
                        <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                            <i class="fa-solid fa-sack-dollar text-xl"></i>
                        </div>
                        <div>
                            <p class="text-[12px] text-gray-400 font-black uppercase tracking-[0.15em] mb-1">STIPEND / SALARY</p>
                            <p class="text-[17px] font-black text-slate-800">4,500 - 6,000 EGP / Month</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-6 group">
                        <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                            <i class="fa-solid fa-clock text-xl"></i>
                        </div>
                        <div>
                            <p class="text-[12px] text-gray-400 font-black uppercase tracking-[0.15em] mb-1">DURATION</p>
                            <p class="text-[17px] font-black text-slate-800">3 Months (Renewable)</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-6 group">
                        <div class="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                            <i class="fa-solid fa-user-group text-lg"></i>
                        </div>
                        <div>
                            <p class="text-[12px] text-gray-400 font-black uppercase tracking-[0.15em] mb-1">WORK HOURS</p>
                            <p class="text-[17px] font-black text-slate-800">40 Hours / Week</p>
                        </div>
                    </div>
                </div>
                <button class="w-full mt-14 bg-[#10b981] hover:bg-[#059669] text-white py-6 rounded-4xl font-black text-xl shadow-2xl shadow-emerald-200/50 transition-all active:scale-95">
                    Apply for this role
                </button>
            </div>

            {/* CV Banner Card */}
            <div class="bg-[#0f172a] rounded-4xl p-12 text-white relative overflow-hidden group shadow-2xl">
                <div class="relative z-10">
                    <h3 class="text-2xl font-black mb-5 leading-tight">Need Help with your CV?</h3>
                    <p class="text-slate-400 text-[14px] mb-12 leading-relaxed font-bold">Our AI-powered CV builder is specifically designed for Egyptian students looking for top-tier internships.</p>
                    <button class="w-full bg-white text-slate-900 py-5 rounded-2xl font-black text-[15px] hover:bg-slate-100 transition active:scale-95 shadow-xl">
                        Try CV Builder
                    </button>
                </div>
                <div class="absolute -bottom-16 -right-16 w-56 h-56 bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
            </div>
        </aside>
    </main>
  </div>

  {/* Wrapper Center Container: تم تصغير العرض لـ 5xl ليتناسب مع الجزء العلوي */}
  <div class="max-w-3xl ml-60 mr-auto px-6 pb-24 mt-10">
    
    {/* Large Card Container */}
    <div class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* 1. Dark Header Section: ملموم ومنسق بنفس أبعاد التصميم */}
        <div class="bg-[#1a2e35] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="flex items-center gap-5">
                {/* Company Logo: نفس الشكل الدائري في الصورة */}
                <div class="w-14 h-14 bg-linear-to-tr from-yellow-200 via-emerald-300 to-blue-400 rounded-full shadow-inner"></div>
                <div>
                    <h2 class="text-xl font-black text-white">About Swvl</h2>
                    <div class="flex items-center gap-4 text-slate-400 font-bold text-[12px] mt-1">
                        <span class="flex items-center gap-2">
                            <i class="fa-solid fa-user-group text-[10px]"></i> 500-1000 Employees
                        </span>
                        <span class="flex items-center gap-2">
                            <i class="fa-solid fa-globe text-[10px]"></i> swvl.com
                        </span>
                    </div>
                </div>
            </div>
            {/* View Profile Button */}
            <button class="bg-white text-[#1a2e35] px-7 py-2.5 rounded-xl font-black text-xs hover:bg-gray-100 transition shadow-md active:scale-95">
                View Profile
            </button>
        </div>

        {/* 2. Content Section (White Background) */}
        <div class="p-8 md:p-10">
            {/* Company Description */}
            <p class="text-gray-500 italic font-medium text-[15px] leading-relaxed mb-10 pl-2">
                "Swvl is the leading tech-enabled mass transit solutions provider, helping millions of people move safely and comfortably every day. Founded in Egypt, we are now a global player redefining the future of urban mobility."
            </p>

            <hr class="border-gray-50 mb-10" />

            {/* More Opportunities Header */}
            <div class="flex items-center gap-3 mb-8 pl-2">
                <h3 class="text-[13px] font-black text-slate-800 uppercase tracking-widest">More Opportunities at Swvl</h3>
                <span class="bg-emerald-50 text-emerald-600 text-[9px] px-2.5 py-1 rounded-full font-black border border-emerald-100 uppercase">3 Available</span>
            </div>

            {/* Grid of Cards: ملمومة بمسافات Gap مناسبة للعرض الجديد */}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Opportunity Card 1 */}
                <div class="p-6 rounded-4xl border border-gray-100 bg-white hover:border-emerald-100 hover:shadow-md transition-all duration-300">
                    <h4 class="text-[15px] font-black text-slate-800 mb-4 leading-tight">Product Design Intern</h4>
                    <div class="text-[12px] text-gray-400 font-bold flex items-center gap-2">
                        <i class="fa-regular fa-clock text-emerald-500"></i> Full-time 
                        <span class="text-gray-200">•</span> 
                        <i class="fa-solid fa-location-dot text-emerald-500"></i> Cairo
                    </div>
                </div>

                {/* Opportunity Card 2 */}
                <div class="p-6 rounded-4xl border border-gray-100 bg-white hover:border-emerald-100 hover:shadow-md transition-all duration-300">
                    <h4 class="text-[15px] font-black text-slate-800 mb-4 leading-tight">Backend Developer</h4>
                    <div class="text-[12px] text-gray-400 font-bold flex items-center gap-2">
                        <i class="fa-solid fa-house-laptop text-emerald-500"></i> Hybrid 
                        <span class="text-gray-200">•</span> 
                        <i class="fa-solid fa-location-dot text-emerald-500"></i> Maadi
                    </div>
                </div>

                {/* Opportunity Card 3 */}
                <div class="p-6 rounded-4xl border border-gray-100 bg-white hover:border-emerald-100 hover:shadow-md transition-all duration-300">
                    <h4 class="text-[15px] font-black text-slate-800 mb-4 leading-tight">Talent Acquisition</h4>
                    <div class="text-[12px] text-gray-400 font-bold flex items-center gap-2">
                        <i class="fa-solid fa-wifi text-emerald-500"></i> Remote 
                        <span class="text-gray-200">•</span> 
                        <i class="fa-solid fa-location-dot text-emerald-500"></i> Egypt
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
    </>
  );
}