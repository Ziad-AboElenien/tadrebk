export default function Profile() {
  return (
    <>
      {/* WRAPPER */}
<div class="flex">
      {/* SIDEBAR */}
      <aside class="w-64 bg-white min-h-screen border-r border-gray-100 p-6 hidden lg:flex flex-col sticky top-18.25">
        {/* Top Navigation Links */}
        <div class="space-y-2 grow">
        <a href="#" class="flex items-center gap-3 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl font-bold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span>Overview</span>
        </a>

        <a href="#" class="flex items-center gap-3 text-gray-500 px-4 py-3 rounded-xl hover:bg-gray-50 font-medium transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
            <span>Saved</span>
        </a>

        <a href="#" class="flex items-center gap-3 text-gray-500 px-4 py-3 rounded-xl hover:bg-gray-50 font-medium transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            <span>Applied</span>
        </a>

        <a href="#" class="flex items-center gap-3 text-gray-500 px-4 py-3 rounded-xl hover:bg-gray-50 font-medium transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            <span>Profile</span>
        </a>

        <a href="#" class="flex items-center gap-3 text-gray-500 px-4 py-3 rounded-xl hover:bg-gray-50 font-medium transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span>Settings</span>
        </a>
    </div>

        {/* Sign Out Button (At the bottom) */}
    <div class="mt-auto pt-6 border-t border-gray-50">
        <button class="w-full flex items-center gap-3 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl font-bold transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>Sign Out</span>
        </button>
    </div>
      </aside>

      {/* MAIN CONTENT */}
      <main class="flex-1 p-8">

        {/* HEADER */}
        <header class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <h1 class="text-3xl font-black text-gray-900 tracking-tight">Welcome back, Ahmed!</h1>
                <p class="text-gray-500 font-medium">You have 2 upcoming interviews this week. Good luck!</p>
            </div>

            <div class="flex space-x-3">
                <button class="px-6 py-2.5 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition">
                    Browse More
                </button>
                <button class="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition flex items-center">
                    <span class="mr-2 text-xl leading-none">+</span> Add Application
                </button>
            </div>
        </header>

        {/* GRID SECTION */}
        <div class="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 mb-8">

            {/* PROFILE CARD */}
            <section class="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="h-28 bg-emerald-500"></div>
                <div class="px-8 pb-8 relative">
                    <div class="absolute -top-12 left-8 bg-white p-2 rounded-3xl shadow-md">
                        <div class="w-24 h-24 bg-slate-900 rounded-[20px] flex items-center justify-center text-white relative">
                            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            <div class="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                        </div>
                    </div>

                    <div class="pt-16 flex justify-between items-start">
                        <div>
                            <h2 class="text-2xl font-black text-gray-900">Emad Abd Elaaty</h2>
                            <p class="text-gray-500 font-medium flex items-center gap-1">
                                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                                Cairo University
                            </p>
                        </div>
                        <button class="text-emerald-600 font-bold text-sm hover:underline">Edit Profile</button>
                    </div>

                    <div class="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-gray-50">
                        <div>
                            <p class="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Major</p>
                            <p class="font-bold text-gray-800">Computer Engineering</p>
                        </div>
                        <div>
                            <p class="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Graduation Year</p>
                            <p class="font-bold text-gray-800">Class of 2025</p>
                        </div>
                        <div>
                            <p class="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">GPA</p>
                            <p class="font-bold text-gray-800">3.8 / 4.0</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROGRESS CARD */}
            <section class="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col">
                <h3 class="font-black text-gray-900 text-lg mb-2">Profile Strength</h3>
                <p class="text-xs text-gray-500 mb-6 font-medium">Complete your profile to get seen by top companies.</p>

                <div class="flex justify-between items-center mb-2 font-bold">
                    <span class="text-xs text-emerald-600">85% Completed</span>
                    <span class="text-[10px] text-gray-400 uppercase">Almost there!</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2 mb-8">
                    <div class="bg-emerald-500 h-2 rounded-full" style="width: 85%"></div>
                </div>

                <ul class="space-y-4 text-xs font-bold text-gray-700">
                    <li class="flex items-center gap-3">
                        <div class="bg-emerald-100 p-1 rounded-full text-emerald-600">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                        </div>
                        Portfolio link added
                    </li>
                    <li class="flex items-center gap-3">
                        <div class="bg-emerald-100 p-1 rounded-full text-emerald-600">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                        </div>
                        CV uploaded
                    </li>
                    <li class="flex items-center gap-3 text-gray-400">
                        <div class="w-5 h-5 border-2 border-gray-200 rounded-full"></div>
                        Add Internship Experience
                    </li>
                </ul>
            </section>
        </div>
      </main>
    </div>

    {/* STATS GRID */}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1 */}
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
        <p class="text-sm font-bold text-gray-500">Total Applied</p>
        <h4 class="text-3xl font-black mt-1 text-gray-900">12</h4>
        
        {/* النص مع الأيقونة */}
        <div class="flex items-center gap-1 mt-2">
          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
            3 new this month
          </p>
        </div>

        {/* الأيقونة الكبيرة في الخلفية */}
        <div class="absolute right-6 top-6 bg-emerald-50 p-3 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </div>
      </div>










    
      {/* Card 2 */}
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
        <p class="text-sm font-bold text-gray-500">Active Interviews</p>
        <h4 class="text-3xl font-black mt-1 text-gray-900">2</h4>

        {/* النص مع الأيقونة */}
        <div class="flex items-center gap-1 mt-2">
          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
            Next on Thursday, 10 AM
          </p>
        </div>

        {/* الأيقونة الكبيرة في الخلفية */}
        <div class="absolute right-6 top-6 bg-emerald-50 p-3 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>









      {/* Card 3 */}
      <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
        <p class="text-sm font-bold text-gray-500">Saved Roles</p>
        <h4 class="text-3xl font-black mt-1 text-gray-900">8</h4>

        {/* النص مع الأيقونة */}
        <div class="flex items-center gap-1 mt-2">
          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
            Expiring soon: 2
          </p>
        </div>

        {/* الأيقونة الكبيرة في الخلفية */}
        <div class="absolute right-6 top-6 bg-emerald-50 p-3 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
          </svg>
        </div>
      </div>
    </div>




    {/* FULL DASHBOARD LOWER SECTION */}
    <div class="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-10 mt-12">

      {/* RECENT APPLICATIONS SECTION */}
      <section class="bg-white rounded-4xl p-10 border border-gray-100 shadow-sm">
        {/* Header */}
        <div class="flex justify-between items-center mb-12">
            <div>
                <h3 class="text-2xl font-black text-gray-900 tracking-tight">Recent Applications</h3>
                <p class="text-sm text-gray-400 font-medium mt-2">Track the status of your submitted applications.</p>
            </div>
            <a href="#" class="text-emerald-500 font-black text-xs uppercase tracking-[0.2em] hover:text-emerald-600 transition-colors">View All</a>
        </div>

        {/* Table */}
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b-2 border-gray-50">
                        <th class="pb-6 text-sm font-black uppercase tracking-[0.15em] text-gray-900">Internship Role</th>
                        <th class="pb-6 text-sm font-black uppercase tracking-[0.15em] text-gray-900">Company</th>
                        <th class="pb-6 text-sm font-black uppercase tracking-[0.15em] text-gray-900">Date Applied</th>
                        <th class="pb-6 text-sm font-black uppercase tracking-[0.15em] text-gray-900 text-right">Status</th>
                    </tr>
                </thead>
                <tbody class="text-sm">
                    {/* Row 1 */}
                    <tr class="group border-b border-gray-50/80 hover:bg-gray-50/50 transition-all">
                        <td class="py-7 flex items-center gap-5">
                            <div class="text-gray-400 bg-gray-100 p-2.5 rounded-xl group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <span class="font-black text-gray-900 text-lg">Software Engineering Intern</span>
                        </td>
                        <td class="py-7 text-gray-600 font-black text-base">Vodafone Egypt</td>
                        <td class="py-7 text-gray-400 font-black text-sm uppercase">Oct 12, 2023</td>
                        <td class="py-7 text-right">
                            <span class="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-black border border-emerald-100 shadow-sm">Interviewing</span>
                        </td>
                    </tr>
                    {/* Row 2 */}
                    <tr class="group border-b border-gray-50/80 hover:bg-gray-50/50 transition-all">
                        <td class="py-7 flex items-center gap-5">
                            <div class="text-gray-400 bg-gray-100 p-2.5 rounded-xl">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <span class="font-black text-gray-900 text-lg">Marketing & Sales Associate</span>
                        </td>
                        <td class="py-7 text-gray-600 font-black text-base">Swvl</td>
                        <td class="py-7 text-gray-400 font-black text-sm uppercase">Oct 05, 2023</td>
                        <td class="py-7 text-right">
                            <span class="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-black">Applied</span>
                        </td>
                    </tr>
                    {/* Row 3 */}
                    <tr class="group border-b border-gray-50/80 hover:bg-gray-50/50 transition-all">
                        <td class="py-7 flex items-center gap-5">
                            <div class="text-gray-400 bg-gray-100 p-2.5 rounded-xl">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <span class="font-black text-gray-900 text-lg">Product Design Trainee</span>
                        </td>
                        <td class="py-7 text-gray-600 font-black text-base">Instabug</td>
                        <td class="py-7 text-gray-400 font-black text-sm uppercase">Sep 28, 2023</td>
                        <td class="py-7 text-right">
                            <span class="px-6 py-2.5 bg-red-50 text-red-500 rounded-full text-[11px] font-black">Rejected</span>
                        </td>
                    </tr>
                    {/* Row 4 */}
                    <tr class="group border-b border-gray-50/80 hover:bg-gray-50/50 transition-all">
                        <td class="py-7 flex items-center gap-5">
                            <div class="text-gray-400 bg-gray-100 p-2.5 rounded-xl">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <span class="font-black text-gray-900 text-lg">Financial Analyst Intern</span>
                        </td>
                        <td class="py-7 text-gray-600 font-black text-base">CIB Egypt</td>
                        <td class="py-7 text-gray-400 font-black text-sm uppercase">Sep 22, 2023</td>
                        <td class="py-7 text-right">
                            <span class="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-black">Applied</span>
                        </td>
                    </tr>
                    {/* Row 5 */}
                    <tr class="group hover:bg-gray-50/50 transition-all">
                        <td class="py-7 flex items-center gap-5">
                            <div class="text-gray-400 bg-gray-100 p-2.5 rounded-xl">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <span class="font-black text-gray-900 text-lg">Data Science Intern</span>
                        </td>
                        <td class="py-7 text-gray-600 font-black text-base">Valeo</td>
                        <td class="py-7 text-gray-400 font-black text-sm uppercase">Sep 15, 2023</td>
                        <td class="py-7 text-right">
                            <span class="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-black">Applied</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </section>

      {/* SIDEBAR COLUMN */}
      <div class="flex flex-col gap-10">
        {/* RESUME CARD */}
        <section class="bg-white rounded-4xl p-10 border border-gray-100 shadow-sm">
            <h3 class="font-black text-2xl text-gray-900 mb-8 tracking-tight">Resume / CV</h3>
            
            <label class="block border-2 border-dashed border-gray-100 rounded-4xl p-12 text-center hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer mb-8 group">
                <div class="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-sm">
                    <svg class="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                </div>
                <p class="text-lg font-black text-gray-900">Click to upload CV</p>
                <p class="text-xs text-gray-400 uppercase font-black tracking-widest mt-2">PDF, DOCX up to 10MB</p>
                <input type="file" class="hidden" />
            </label>

            {/* File Item */}
            <div class="bg-gray-50/50 rounded-2xl p-5 flex items-center justify-between border border-gray-100">
                <div class="flex items-center gap-4">
                    <div class="bg-white text-red-500 px-4 py-2.5 rounded-xl text-xs font-black shadow-sm border border-red-50">PDF</div>
                    <div>
                        <p class="font-black text-base text-gray-900">Ahmed_Hassan_CV.pdf</p>
                        <p class="text-xs text-gray-400 font-bold">Uploaded 2 days ago</p>
                    </div>
                </div>
                <button class="text-gray-300 hover:text-red-500 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        </section>

        {/* HELP CARD */}
        <section class="bg-[#0F172A] rounded-4xl p-10 text-white relative overflow-hidden group shadow-2xl">
            <div class="relative z-10">
                <h3 class="font-black text-3xl mb-4 tracking-tight">Need CV Help?</h3>
                <p class="text-base text-slate-400 mb-10 font-medium leading-relaxed italic opacity-90">Our career experts offer free CV reviews for Egyptian students to help you stand out.</p>
                <button class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl text-sm uppercase tracking-widest transition-all transform active:scale-95 shadow-lg shadow-emerald-900/50">
                    Book Free Review
                </button>
            </div>
            {/* Decorative Icon */}
            <div class="absolute -right-12 -bottom-12 text-emerald-500/10 transform rotate-12 group-hover:rotate-0 transition-all duration-700">
                <svg class="w-56 h-56" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
            </div>
        </section>
      </div>
    </div>

    {/* SAVED INTERNSHIPS SECTION (Expanded) */}
    <section class="mt-12 pb-16">
      {/* Header */}
      <div class="flex justify-between items-center mb-8">
        <div>
          <h3 class="text-2xl font-black text-gray-900 tracking-tight">Saved Internships</h3>
          <p class="text-base text-gray-400 font-medium mt-1">Roles you've bookmarked for later.</p>
        </div>
        <button class="px-8 py-3 bg-white border-2 border-gray-100 text-gray-900 font-black text-sm rounded-2xl shadow-sm hover:bg-gray-50 transition-all">
          See All Saved
        </button>
      </div>

      {/* Cards Grid */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1 */}
        <div class="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center gap-5 mb-8">
            {/* Logo Space (Large) */}
            <div class="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 shrink-0 flex items-center justify-center">
              {/* ضع صورتك هنا */}
              <div class="w-8 h-8 bg-gray-200 rounded-lg"></div>
                </div>
                <div>
                    <h4 class="text-lg font-black text-gray-900 leading-tight">UX/UI Design Intern</h4>
                    <p class="text-base font-bold text-gray-400 mt-1">Robosta</p>
                </div>
            </div>
            
            <div class="flex items-center gap-3 mb-10">
                <span class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-black">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    Cairo, Egypt
                </span>
                <span class="px-4 py-2 bg-emerald-50 text-emerald-500 rounded-xl text-xs font-black border border-emerald-100/50">Paid</span>
            </div>
            
            <button class="w-full bg-[#34D399] hover:bg-[#10B981] text-white font-black py-5 rounded-[20px] text-base transition-all transform active:scale-95 shadow-lg shadow-emerald-100">
                View Details
            </button>
        </div>

        {/* Card 2 */}
        <div class="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center gap-5 mb-8">
                <div class="w-16 h-16 bg-yellow-50 rounded-2xl border border-yellow-100 shrink-0 flex items-center justify-center">
                    <div class="w-8 h-8 bg-yellow-200 rounded-lg"></div>
                </div>
                <div>
                    <h4 class="text-lg font-black text-gray-900 leading-tight">Backend Engineer (No...</h4>
                    <p class="text-base font-bold text-gray-400 mt-1">Breadfast</p>
                </div>
            </div>
            
            <div class="flex items-center gap-3 mb-10">
                <span class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-black">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                    Remote
                </span>
                <span class="px-4 py-2 bg-emerald-50 text-emerald-500 rounded-xl text-xs font-black border border-emerald-100/50">Full-time</span>
            </div>
            
            <button class="w-full bg-[#34D399] hover:bg-[#10B981] text-white font-black py-5 rounded-[20px] text-base transition-all transform active:scale-95 shadow-lg shadow-emerald-100">
                View Details
            </button>
        </div>

        {/* Card 3 */}
        <div class="bg-white p-10 rounded-4xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center gap-5 mb-8">
                <div class="w-16 h-16 bg-orange-50 rounded-2xl border border-orange-100 shrink-0 flex items-center justify-center">
                    <div class="w-8 h-8 bg-orange-200 rounded-lg"></div>
                </div>
                <div>
                    <h4 class="text-lg font-black text-gray-900 leading-tight">HR Generalist Trainee</h4>
                    <p class="text-base font-bold text-gray-400 mt-1">PwC Middle East</p>
                </div>
            </div>
            
            <div class="flex items-center gap-3 mb-10">
                <span class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-black">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                    Alexandria, Egypt
                </span>
                <span class="px-4 py-2 bg-emerald-50 text-emerald-500 rounded-xl text-xs font-black border border-emerald-100/50">Paid</span>
            </div>
            
            <button class="w-full bg-[#34D399] hover:bg-[#10B981] text-white font-black py-5 rounded-[20px] text-base transition-all transform active:scale-95 shadow-lg shadow-emerald-100">
                View Details
            </button>
        </div>
      </div>
    </section>
    </>
  );
}