export default function Internships() {
  return (
    <div class="flex flex-col min-h-screen">
<header class="w-full bg-white border-b border-gray-200 h-17.5 px-6 md:px-16 flex items-center sticky top-0 z-50 shadow-sm">
  
  <div class="relative flex items-center shrink-0 overflow-visible">
    <img 
      src="../image/tadebk2-removebg-preview.png" 
      alt="Tadrebk Logo" 
      class="h-40 w-auto object-contain absolute left--10 top-1/2 -translate-y-1/2 z-20"
    />
    <div class="w-48"></div> 
  </div>

  <div class="flex flex-1 items-center justify-between">
    
    <nav class="hidden md:flex items-center gap-10 text-sm font-bold">
      <a href="index.html" class="text-gray-500 hover:text-[#2ecc71] transition-colors">How it works</a>
      <a href="#" class="text-[#2ecc71]">Internships</a>
      <a href="#" class="text-gray-500 hover:text-[#2ecc71] transition-colors">For Companies</a>
    </nav>

    <div class="flex items-center gap-6">
      <button class="text-sm font-black text-gray-800 hover:text-black">Sign in</button>
      <button class="bg-[#2ecc71] hover:bg-[#27ae60] text-white text-sm font-black py-2.5 px-6 rounded-xl shadow-sm transition-all">
        Sign up
      </button>
    </div>
  </div>

</header>
    <section class="w-full pt-24.5 pb-0 px-6 md:px-16">
      <div class="max-w-7xl mx-auto">
        
        <div class="bg-white p-4 md:p-5 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col md:flex-row items-center gap-4 w-full">
          
          <div class="flex-1 flex items-center gap-3 px-5 bg-[#f9fafb] rounded-[20px] w-full border border-transparent focus-within:border-green-100 focus-within:bg-white transition-all">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search by role, company, or skill..." 
              class="bg-transparent w-full py-4 outline-none text-[15px] font-medium text-gray-700"
            />
          </div>

          <div class="flex-1 flex items-center gap-3 px-5 bg-[#f9fafb] rounded-[20px] w-full border border-transparent focus-within:border-green-100 focus-within:bg-white transition-all">
            <svg class="w-5 h-5 text-[#2ecc71]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            <input 
              type="text" 
              placeholder="Anywhere in Egypt" 
              class="bg-transparent w-full py-4 outline-none text-[15px] font-medium text-gray-700"
            />
          </div>

          <button class="w-full md:w-auto bg-[#2ecc71] hover:bg-[#27ae60] text-white font-black px-14 py-4 rounded-[22px] shadow-lg shadow-green-100 transition-all active:scale-95">
            Search
          </button>

        </div>
      </div>
    </section>

  











   <main class="max-w-7xl mx-auto px-6 md:px-16 pb-20 mt-16 ">


  <div class="flex justify-between items-center mb-8">
    <div class="flex items-center gap-3">
      <h2 class="text-2xl font-black text-[#0f172a]">All Internships</h2>
      <span class="bg-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">124 results</span>
    </div>
    <div class="flex items-center gap-2 text-sm font-bold text-gray-500">
      <span>Sort by:</span>
      <select class="bg-transparent text-[#0f172a] font-bold outline-none cursor-pointer">
        <option>Newest First</option>
        <option>Oldest</option>
      </select>
    </div>
  </div>
<div class="flex flex-col md:flex-row gap-8">
    <aside class="w-full md:w-64 shrink-0">
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
        <div class="flex justify-between items-center mb-6">
          <h3 class="font-black text-gray-900">Filters</h3>
          <button class="text-[#22c55e] text-xs font-bold">Clear all</button>
        </div>

        <div class="mb-8">
          <h4 class="text-sm font-black text-gray-800 mb-4 flex justify-between items-center cursor-pointer">
            Field of Interest
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </h4>
          <div class="space-y-3">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600 group-hover:text-gray-900">Engineering</span>
            </label>
             <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600 group-hover:text-gray-900">Design</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600 group-hover:text-gray-900">Marketing</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600 group-hover:text-gray-900">Business</span>
            </label>

            
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e] focus:ring-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600 group-hover:text-gray-900">Data Science</span>
            </label>

          </div>
        </div>

        <div class="mb-8 border-t border-gray-50 pt-6">
          <h4 class="text-sm font-black text-gray-800 mb-4 flex justify-between items-center cursor-pointer">
            Location
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </h4>
          <div class="space-y-3">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600">New Cairo</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600">Maadi</span>
            </label>

             <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600">Smart Village</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600">Nasr City</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600">ALexandria</span>
            </label>


          </div>
        </div>

        <div class="mb-8 border-t border-gray-50 pt-6">
          <h4 class="text-sm font-black text-gray-800 mb-4 flex justify-between items-center cursor-pointer">
            Job Type
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </h4>
          <div class="space-y-3">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600">Full-time</span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" class="w-5 h-5 rounded border-gray-300 text-[#22c55e]" />
              <span class="text-sm font-semibold text-gray-600">Part-time</span>
            </label>


             
          </div>
        </div>

        <div class="mb-8 border-t border-gray-50 pt-6">
          <h4 class="text-sm font-black text-gray-800 mb-4 flex justify-between items-center cursor-pointer">
            Compensation & Work
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </h4>
        </div>

        <div class="bg-green-50 p-4 rounded-2xl border border-green-100 mt-6">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[#22c55e]">⚡</span>
            <span class="text-xs font-black text-green-800 uppercase tracking-tighter">Fast Track</span>
          </div>
          <p class="text-[10px] text-green-700 font-bold leading-tight mb-3">Create a student profile to get personalized recommendations and apply in one click.</p>
          <button class="w-full bg-white text-[#22c55e] border border-[#22c55e] py-2 rounded-xl text-xs font-bold hover:bg-[#22c55e] hover:text-white transition-all">Create Profile</button>
        </div>
      </div>
    </aside>


    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <div class="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
        <div class="absolute top-6 right-6 flex gap-2">
          <span class="bg-green-100 text-[#22c55e] text-[9px] font-black px-2 py-1 rounded-md uppercase">Paid</span>
          <span class="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-1 rounded-md uppercase">Remote</span>
        </div>
        <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-50 overflow-hidden"><img src="image/vodafone-logo.png" class="w-8 h-8 object-contain" alt="company logo" /></div>
        <h3 class="font-black text-[17px] text-gray-900 leading-snug mb-1 group-hover:text-[#22c55e] transition-colors">Software Engineering Intern</h3>
        <p class="text-sm font-bold text-gray-400 mb-6">Vodafone Egypt</p>
        <div class="space-y-3 mb-8">
          <div class="flex items-center gap-2 text-gray-500">
            <svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
            <span class="text-[11px] font-bold">Smart Village, Giza</span>
          </div>
          <div class="flex items-center gap-2 text-gray-500">
            <svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="text-[11px] font-bold">3 Months • Full-time</span>
          </div>
        </div>
        <div class="flex gap-2">
         <a href="kkkk.html" class="flex-1 bg-[#22c55e] text-white py-3 rounded-2xl text-[13px] font-black shadow-lg shadow-purple-100 hover:bg-[#16a34a] transition-all inline-block text-center">
           Apply Now
         </a>
          <button class="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 border border-gray-100 transition-all"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
        <div class="absolute top-6 right-6 flex gap-2">
          <span class="bg-green-100 text-[#22c55e] text-[9px] font-black px-2 py-1 rounded-md uppercase">Paid</span>
          <span class="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-1 rounded-md uppercase">Remote</span>
        </div>
        <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-50 overflow-hidden"><img src="image/swvl-logo.png" class="w-8 h-8 object-contain" alt="company logo" /></div>
        <h3 class="font-black text-[17px] text-gray-900 leading-snug mb-1 group-hover:text-[#22c55e] transition-colors">UX/UI Designer Intern</h3>
        <p class="text-sm font-bold text-gray-400 mb-6">Swvl</p>
        <div class="space-y-3 mb-8">
          <div class="flex items-center gap-2 text-gray-500"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg><span class="text-[11px] font-bold">Maadi, Cairo</span></div>
          <div class="flex items-center gap-2 text-gray-500"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span class="text-[11px] font-bold">6 Months • Part-time</span></div>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 bg-[#22c55e] text-white py-3 rounded-2xl text-[13px] font-black hover:bg-[#16a34a] transition-all">Apply Now</button>
          <button class="p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
        <div class="absolute top-6 right-6 flex gap-2">
          <span class="bg-green-100 text-[#22c55e] text-[9px] font-black px-2 py-1 rounded-md uppercase">Paid</span>
        </div>
        <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-50 overflow-hidden"><img src="image/jumia-logo.png" class="w-8 h-8 object-contain" alt="company logo" /></div>
        <h3 class="font-black text-[17px] text-gray-900 leading-snug mb-1 group-hover:text-[#22c55e] transition-colors">Marketing Specialist Intern</h3>
        <p class="text-sm font-bold text-gray-400 mb-6">Jumia Egypt</p>
        <div class="space-y-3 mb-8 text-gray-500">
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg><span class="text-[11px] font-bold">New Cairo</span></div>
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span class="text-[11px] font-bold">2 Months • Full-time</span></div>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 bg-[#22c55e] text-white py-3 rounded-2xl text-[13px] font-black hover:bg-[#16a34a] transition-all">Apply Now</button>
          <button class="p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
        <div class="absolute top-6 right-6 flex gap-2"><span class="bg-green-100 text-[#22c55e] text-[9px] font-black px-2 py-1 rounded-md uppercase">Paid</span></div>
        <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-50 overflow-hidden"><img src="image/orange-logo.png" class="w-8 h-8 object-contain" alt="company logo" /></div>
        <h3 class="font-black text-[17px] text-gray-900 leading-snug mb-1 group-hover:text-[#22c55e] transition-colors">Data Analyst Intern</h3>
        <p class="text-sm font-bold text-gray-400 mb-6">Orange Egypt</p>
        <div class="space-y-3 mb-8 text-gray-500">
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg><span class="text-[11px] font-bold">Agouza, Cairo</span></div>
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span class="text-[11px] font-bold">3 Months • Full-time</span></div>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 bg-[#22c55e] text-white py-3 rounded-2xl text-[13px] font-black hover:bg-[#16a34a] transition-all">Apply Now</button>
          <button class="p-3 bg-gray-50 rounded-2xl border border-gray-100"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
        <div class="absolute top-6 right-6 flex gap-2"><span class="bg-green-100 text-[#22c55e] text-[9px] font-black px-2 py-1 rounded-md uppercase">Paid</span><span class="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-1 rounded-md uppercase">Remote</span></div>
        <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-50 overflow-hidden"><img src="image/instabug-logo.png" class="w-8 h-8 object-contain" alt="company logo" /></div>
        <h3 class="font-black text-[17px] text-gray-900 leading-snug mb-1 group-hover:text-[#22c55e] transition-colors">Business Development Intern</h3>
        <p class="text-sm font-bold text-gray-400 mb-6">Instabug</p>
        <div class="space-y-3 mb-8 text-gray-500">
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg><span class="text-[11px] font-bold">Maadi, Cairo</span></div>
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span class="text-[11px] font-bold">4 Months • Part-time</span></div>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 bg-[#22c55e] text-white py-3 rounded-2xl text-[13px] font-black hover:bg-[#16a34a] transition-all">Apply Now</button>
          <button class="p-3 bg-gray-50 rounded-2xl border border-gray-100"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
        <div class="absolute top-6 right-6 flex gap-2"><span class="bg-green-100 text-[#22c55e] text-[9px] font-black px-2 py-1 rounded-md uppercase">Paid</span></div>
        <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-50 overflow-hidden"><img src="image/pepsico-logo.png" class="w-8 h-8 object-contain" alt="company logo" /></div>
        <h3 class="font-black text-[17px] text-gray-900 leading-snug mb-1 group-hover:text-[#22c55e] transition-colors">HR Operations Intern</h3>
        <p class="text-sm font-bold text-gray-400 mb-6">PepsiCo Egypt</p>
        <div class="space-y-3 mb-8 text-gray-500">
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg><span class="text-[11px] font-bold">Nasr City, Cairo</span></div>
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span class="text-[11px] font-bold">3 Months • Full-time</span></div>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 bg-[#22c55e] text-white py-3 rounded-2xl text-[13px] font-black hover:bg-[#16a34a] transition-all">Apply Now</button>
          <button class="p-3 bg-gray-50 rounded-2xl border border-gray-100"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
        <div class="absolute top-6 right-6 flex gap-2"><span class="bg-green-100 text-[#22c55e] text-[9px] font-black px-2 py-1 rounded-md uppercase">Paid</span></div>
        <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-50 overflow-hidden"><img src="image/fawry-logo.png" class="w-8 h-8 object-contain" alt="company logo" /></div>
        <h3 class="font-black text-[17px] text-gray-900 leading-snug mb-1 group-hover:text-[#22c55e] transition-colors">Backend Developer Intern (Java)</h3>
        <p class="text-sm font-bold text-gray-400 mb-6">Fawry</p>
        <div class="space-y-3 mb-8 text-gray-500">
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg><span class="text-[11px] font-bold">Dokki, Giza</span></div>
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span class="text-[11px] font-bold">3 Months • Full-time</span></div>
        </div>
        <div class="flex gap-2">
          
          <button class="flex-1 bg-[#22c55e] text-white py-3 rounded-2xl text-[13px] font-black hover:bg-[#16a34a] transition-all">Apply Now</button>
          <button class="p-3 bg-gray-50 rounded-2xl border border-gray-100"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
        <div class="absolute top-6 right-6 flex gap-2"><span class="bg-green-100 text-[#22c55e] text-[9px] font-black px-2 py-1 rounded-md uppercase">Paid</span><span class="bg-gray-100 text-gray-500 text-[9px] font-black px-2 py-1 rounded-md uppercase">Remote</span></div>
        <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-50 overflow-hidden"><img src="image/roya-logo.png" class="w-8 h-8 object-contain" alt="company logo" /></div>
        <h3 class="font-black text-[17px] text-gray-900 leading-snug mb-1 group-hover:text-[#22c55e] transition-colors">Graphic Design Intern</h3>
        <p class="text-sm font-bold text-gray-400 mb-6">Roya Media</p>
        <div class="space-y-3 mb-8 text-gray-500">
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg><span class="text-[11px] font-bold">New Cairo</span></div>
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span class="text-[11px] font-bold">6 Months • Part-time</span></div>
          
        </div>
        <div class="flex gap-2">
          <button class="flex-1 bg-[#22c55e] text-white py-3 rounded-2xl text-[13px] font-black hover:bg-[#16a34a] transition-all">Apply Now</button>
          <button class="p-3 bg-gray-50 rounded-2xl border border-gray-100"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative">
     
        <div class="absolute top-6 right-6 flex gap-2"><span class="bg-green-100 text-[#22c55e] text-[9px] font-black px-2 py-1 rounded-md uppercase">Paid</span></div>
        <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-50 overflow-hidden"><img src="image/etisalat-logo.png" class="w-8 h-8 object-contain" alt="company logo" /></div>
        <h3 class="font-black text-[17px] text-gray-900 leading-snug mb-1 group-hover:text-[#22c55e] transition-colors">Quality Assurance (QA) Intern</h3>
        <p class="text-sm font-bold text-gray-400 mb-6">Etisalat Egypt</p>
        <div class="space-y-3 mb-8 text-gray-500">
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg><span class="text-[11px] font-bold">New Cairo</span></div>
          <div class="flex items-center gap-2"><svg class="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span class="text-[11px] font-bold">3 Months • Full-time</span></div>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 bg-[#22c55e] text-white py-3 rounded-2xl text-[13px] font-black hover:bg-[#16a34a] transition-all">Apply Now</button>
          <button class="p-3 bg-gray-50 rounded-2xl border border-gray-100"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg></button>
        </div>
      </div>

    </div>
  </div>

        <div class="mt-20 text-center">
            <button class="border-2 border-[#22c55e] text-[#22c55e] font-black px-16 py-5 rounded-3xl hover:bg-[#22c55e] hover:text-white transition-all shadow-md active:scale-95">
                Load More Opportunities
            </button>
            <p class="text-gray-400 text-xs font-black mt-6 uppercase tracking-widest">Showing 9 of 124 internships</p>
        </div>
</main>








///////////////////////////////////////////////

{/* 
<section class="max-w-7xl mx-auto px-6 md:px-16 py-16">
  <h2 class="text-2xl font-black text-[#0f172a] mb-10">Popular Categories</h2>
  
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
    <div class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group cursor-pointer">
      <div class="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#2ecc71] transition-all">
        <svg class="w-7 h-7 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
      </div>
      <h3 class="font-black text-gray-900 text-[15px]">Software</h3>
      <p class="text-gray-400 text-xs font-bold mt-2">42 Roles</p>
    </div>

    <div class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group cursor-pointer">
      <div class="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#2ecc71] transition-all">
        <svg class="w-7 h-7 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
      </div>
      <h3 class="font-black text-gray-900 text-[15px]">Design</h3>
      <p class="text-gray-400 text-xs font-bold mt-2">18 Roles</p>
    </div>

    <div class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group cursor-pointer">
      <div class="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#2ecc71] transition-all">
        <svg class="w-7 h-7 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      </div>
      <h3 class="font-black text-gray-900 text-[15px]">Marketing</h3>
      <p class="text-gray-400 text-xs font-bold mt-2">24 Roles</p>
    </div>

    <div class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group cursor-pointer">
      <div class="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#2ecc71] transition-all">
        <svg class="w-7 h-7 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h3 class="font-black text-gray-900 text-[15px]">Finance</h3>
      <p class="text-gray-400 text-xs font-bold mt-2">12 Roles</p>
    </div>

    <div class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group cursor-pointer">
      <div class="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#2ecc71] transition-all">
        <svg class="w-7 h-7 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
      </div>
      <h3 class="font-black text-gray-900 text-[15px]">Data</h3>
      <p class="text-gray-400 text-xs font-bold mt-2">15 Roles</p>
    </div>

    <div class="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group cursor-pointer">
      <div class="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#2ecc71] transition-all">
        <svg class="w-7 h-7 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <h3 class="font-black text-gray-900 text-[15px]">HR</h3>
      <p class="text-gray-400 text-xs font-bold mt-2">13 Roles</p>
    </div>
  </div>
</section>

 */}

<section class="w-full  py-20 px-6 md:px-16">
  <div class="max-w-400 mx-auto"> <h2 class="text-2xl font-black text-[#0f172a] mb-10">Popular Categories</h2>
    
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      
      <div class="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group cursor-pointer flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2ecc71] transition-all">
          <svg class="w-8 h-8 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        </div>
        <h3 class="font-black text-gray-900 text-[17px]">Software</h3>
        <p class="text-gray-400 text-sm font-bold mt-2">42 Roles</p>
      </div>

      <div class="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group cursor-pointer flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2ecc71] transition-all">
          <svg class="w-8 h-8 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18"/></svg>
        </div>
        <h3 class="font-black text-gray-900 text-[17px]">Design</h3>
        <p class="text-gray-400 text-sm font-bold mt-2">18 Roles</p>
      </div>

      <div class="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group cursor-pointer flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2ecc71] transition-all">
          <svg class="w-8 h-8 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <h3 class="font-black text-gray-900 text-[17px]">Marketing</h3>
        <p class="text-gray-400 text-sm font-bold mt-2">24 Roles</p>
      </div>

      <div class="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group cursor-pointer flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2ecc71] transition-all">
          <svg class="w-8 h-8 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h3 class="font-black text-gray-900 text-[17px]">Finance</h3>
        <p class="text-gray-400 text-sm font-bold mt-2">12 Roles</p>
      </div>

      <div class="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group cursor-pointer flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2ecc71] transition-all">
          <svg class="w-8 h-8 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
        <h3 class="font-black text-gray-900 text-[17px]">Data</h3>
        <p class="text-gray-400 text-sm font-bold mt-2">15 Roles</p>
      </div>

      <div class="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group cursor-pointer flex flex-col items-center justify-center text-center">
        <div class="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2ecc71] transition-all">
          <svg class="w-8 h-8 text-[#2ecc71] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <h3 class="font-black text-gray-900 text-[17px]">HR</h3>
        <p class="text-gray-400 text-sm font-bold mt-2">13 Roles</p>
      </div>

    </div>
  </div>
</section>



///////////////////////////////////////////////////


{/*  
<footer class="bg-white border-t border-gray-100 pt-20 pb-10 px-6 md:px-16 mt-20">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
      
      <div>
        <h3 class="text-[#2ecc71] font-black text-xl mb-6">Tadrebk</h3>
        <p class="text-gray-500 text-sm font-medium leading-relaxed mb-8 max-w-70">
          Connecting Egypt's brightest university students with the future of work.
        </p>
        <div class="flex gap-4">
          <a href="#" class="text-[#2ecc71] hover:scale-110 transition-transform"><i class="fab fa-linkedin-in"></i></a>
          <a href="#" class="text-[#2ecc71] hover:scale-110 transition-transform"><i class="fab fa-twitter"></i></a>
          <a href="#" class="text-[#2ecc71] hover:scale-110 transition-transform"><i class="fab fa-instagram"></i></a>
          <a href="#" class="text-[#2ecc71] hover:scale-110 transition-transform"><i class="fab fa-facebook-f"></i></a>
        </div>
      </div>

      <div>
        <h4 class="font-black text-gray-900 mb-6 text-sm">For Students</h4>
        <ul class="space-y-4">
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Browse Internships</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Student Dashboard</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Career Advice</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">CV Builder</a></li>
        </ul>
      </div>

      <div>
        <h4 class="font-black text-gray-900 mb-6 text-sm">For Companies</h4>
        <ul class="space-y-4">
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Post an Internship</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Talent Solutions</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Success Stories</a></li>
        </ul>
      </div>

      <div>
        <h4 class="font-black text-gray-900 mb-6 text-sm">Support</h4>
        <ul class="space-y-4">
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Help Center</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Contact Us</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Privacy Policy</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Terms of Service</a></li>
        </ul>
      </div>

    </div>

    <div class="border-t border-gray-50 pt-8 text-center">
      <p class="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
        © 2026 Tadrebk. All rights reserved. Built for students in Egypt.
      </p>
    </div>
  </div>



*/}


<footer class="bg-white border-t border-gray-100 pt-24 pb-12 px-6 md:px-16">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-20">
      
      <div class="space-y-8">
        <h3 class="text-[#2ecc71] font-black text-3xl tracking-tighter">Tadrebk</h3>
        <p class="text-gray-500 text-[15px] font-medium leading-relaxed max-w-65">
          Connecting Egypt's brightest university students with the future of work.
        </p>
        <div class="flex gap-5">
          <a href="#" class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#2ecc71] hover:bg-[#2ecc71] hover:text-white transition-all"><i class="fab fa-linkedin-in"></i></a>
          <a href="#" class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#2ecc71] hover:bg-[#2ecc71] hover:text-white transition-all"><i class="fab fa-instagram"></i></a>
          <a href="#" class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#2ecc71] hover:bg-[#2ecc71] hover:text-white transition-all"><i class="fab fa-facebook-f"></i></a>
        </div>
      </div>

      <div>
        <h4 class="font-black text-gray-900 mb-8 text-[16px]">For Students</h4>
        <ul class="space-y-5">
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Browse Internships</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Student Dashboard</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Career Advice</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">CV Builder</a></li>
        </ul>
      </div>

      <div>
        <h4 class="font-black text-gray-900 mb-8 text-[16px]">For Companies</h4>
        <ul class="space-y-5">
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Post an Internship</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Talent Solutions</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Success Stories</a></li>
        </ul>
      </div>

      <div>
        <h4 class="font-black text-gray-900 mb-8 text-[16px]">Support</h4>
        <ul class="space-y-5">
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Help Center</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Contact Us</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Privacy Policy</a></li>
          <li><a href="#" class="text-gray-500 hover:text-[#2ecc71] text-sm font-bold transition-colors">Terms of Service</a></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-gray-50 pt-8 text-center">
      <p class="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
        © 2026 Tadrebk. All rights reserved. Built for students in Egypt.
      </p>
    </div>
  </div>
</footer>
  </div>
  );
}