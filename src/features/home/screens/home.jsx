import Link from "next/link";

export default function HomeComponent() {
    return <>
        <header class="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-50">
            <div class="flex items-center gap-10">
                <div class="flex items-center">
                    <img
                        src="../image/tadebk2-removebg-preview.png"
                        alt="Logo"
                        class="h-40 w-auto object-contain"
                    />
                </div>
                <nav class="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
                    <Link href="#" class="text-[#10b981]">How it works</Link>
                    <Link href="internships" class="hover:text-[#10b981] transition">
                        Internships
                    </Link>

                    <Link href="#" class="hover:text-[#10b981] transition">For Companies</Link>
                </nav>
            </div>
            <div class="flex items-center gap-4">
                <Link href="get-started" class="text-sm font-bold text-gray-600">Sign in</Link>
                <Link href="get-started" class="bg-[#10b981] text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-emerald-100 transition hover:bg-[#059669]">Sign up</Link>
            </div>
        </header>

        <section class="max-w-6xl mx-auto mt-16 px-4">
            <div class="bg-white rounded-[40px] p-12 md:p-24 text-center shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-50">
                <span class="text-[#10b981] text-xs tracking-widest uppercase mb-6 block font-black">Now over 500+ active internships</span>
                <h1 class="text-5xl md:text-7xl font-black text-[#1a2e35] mb-8 leading-tight tracking-tight">
                    Find internships that <br /> <span class="text-[#10b981]">launch your career</span>
                </h1>
                <p class="text-gray-400 text-lg max-w-2xl mx-auto mb-12 font-medium">The first platform in Egypt that brings together internship opportunities for university students in one organized and professional place.</p>

                <div class="flex flex-col md:flex-row items-center bg-white border border-gray-100 rounded-2xl p-2 shadow-2xl shadow-gray-200/50 max-w-4xl mx-auto gap-2">
                    <div class="flex-1 flex items-center px-4 w-full">
                        <i class="fas fa-search text-gray-300 mr-3"></i>
                        <input type="text" placeholder="Job title, skill or company" class="w-full py-3 outline-none text-gray-600" />
                    </div>
                    <div class="hidden md:block w-px h-8 bg-gray-100"></div>
                    <div class="flex-1 flex items-center px-4 w-full">
                        <i class="fas fa-location-dot text-gray-300 mr-3"></i>
                        <input type="text" placeholder="Location (Cairo, Giza...)" class="w-full py-3 outline-none text-gray-600" />
                    </div>
                    <button class="w-full md:w-auto bg-[#10b981] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#059669] transition">Search Internships</button>
                </div>
            </div>
        </section>

        <section class="mt-51.5 px-6 max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div class="text-left">
                    <h2 class="text-4xl font-black text-[#1a2e35] mb-3 tracking-tight">Browse by Category</h2>
                    <p class="text-gray-400 text-lg font-medium">Explore opportunities across various fields.</p>
                </div>
                <Link href="#" class="inline-flex items-center px-8 py-3 border-2 border-[#10b981] text-[#10b981] font-bold rounded-full text-sm hover:bg-[#10b981] hover:text-white transition shadow-sm">View All Categories</Link>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="group bg-white p-10 rounded-lg border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)] hover:-translate-y-3 transition-all duration-500 cursor-pointer text-left">
                    <div class="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center text-[#10b981] mb-8 group-hover:bg-[#10b981] group-hover:text-white transition duration-300">
                        <i class="fas fa-code text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-[#1a2e35] mb-2 tracking-tight">Software Engineering</h3>
                    <p class="text-gray-400 font-bold text-sm uppercase tracking-widest">142 open roles</p>
                </div>

                <div class="group bg-white p-10 rounded-lg border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)] hover:-translate-y-3 transition-all duration-500 cursor-pointer text-left">
                    <div class="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center text-[#10b981] mb-8 group-hover:bg-[#10b981] group-hover:text-white transition duration-300">
                        <i class="fas fa-chart-line text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-[#1a2e35] mb-2 tracking-tight">Marketing & Sales</h3>
                    <p class="text-gray-400 font-bold text-sm uppercase tracking-widest">86 open roles</p>
                </div>

                <div class="group bg-white p-10 rounded-lg border-2 border-[#10b981] shadow-[0_30px_70px_rgba(16,185,129,0.15)] hover:-translate-y-3 transition-all duration-500 cursor-pointer text-left">
                    <div class="w-16 h-16 bg-[#10b981] rounded-lg flex items-center justify-center text-white mb-8">
                        <i class="fas fa-palette text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-[#1a2e35] mb-2 tracking-tight">UI/UX Design</h3>
                    <p class="text-gray-400 font-bold text-sm uppercase tracking-widest">54 open roles</p>
                </div>

                <div class="group bg-white p-10 rounded-lg border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)] hover:-translate-y-3 transition-all duration-500 cursor-pointer text-left">
                    <div class="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center text-[#10b981] mb-8 group-hover:bg-[#10b981] group-hover:text-white transition duration-300">
                        <i class="fas fa-bullhorn text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-[#1a2e35] mb-2 tracking-tight">Digital Marketing</h3>
                    <p class="text-gray-400 font-bold text-sm uppercase tracking-widest">32 open roles</p>
                </div>

                <div class="group bg-white p-10 rounded-lg border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)] hover:-translate-y-3 transition-all duration-500 cursor-pointer text-left">
                    <div class="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center text-[#10b981] mb-8 group-hover:bg-[#10b981] group-hover:text-white transition duration-300">
                        <i class="fas fa-coins text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-[#1a2e35] mb-2 tracking-tight">Finance & Accounting</h3>
                    <p class="text-gray-400 font-bold text-sm uppercase tracking-widest">24 open roles</p>
                </div>

                <div class="group bg-white p-10 rounded-lg border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)] hover:-translate-y-3 transition-all duration-500 cursor-pointer text-left">
                    <div class="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center text-[#10b981] mb-8 group-hover:bg-[#10b981] group-hover:text-white transition duration-300">
                        <i class="fas fa-users text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-[#1a2e35] mb-2 tracking-tight">Human Resources</h3>
                    <p class="text-gray-400 font-bold text-sm uppercase tracking-widest">19 open roles</p>
                </div>
            </div>
        </section>







        <section class="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-7xl mx-auto p-8 rounded-xl bg-white shadow-xl">

                <div class="text-center pt-24.5 mb-12">
                    <span class="inline-block bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Handpicked Opportunities
                    </span>
                    <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mt-4 leading-tight">
                        Featured Internships
                    </h2>
                    <p class="text-gray-600 mt-5 max-w-2xl mx-auto text-lg">
                        These premium listings are from top-tier companies actively seeking talent for their upcoming programs.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    <div class="bg-white border border-gray-100 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all relative">
                        <span class="absolute top-5 right-5 text-[11px] font-semibold text-gray-400 uppercase">Featured</span>
                        <div class="w-14 h-14 bg-black rounded-xl mb-5 flex items-center justify-center">
                            <span class="text-white text-xs font-bold">SWVL</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 leading-snug">Fullstack Web Developer Intern</h3>
                        <p class="text-green-600 text-sm font-medium mb-5">Swvl</p>
                        <div class="space-y-3.5 text-base text-gray-600">
                            <div class="flex items-center gap-2.5">
                                <svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                                Cairo, Egypt
                            </div>
                            <div class="flex items-center gap-2.5">
                                <svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                Full-time (Hybrid)
                            </div>
                            <div class="flex items-center gap-2.5 font-semibold text-gray-800">
                                <svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                4,000 EGP / month
                            </div>
                        </div>
                        <button class="w-full mt-7 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-3 px-4 rounded-xl transition-colors text-lg">
                            View Details
                        </button>
                    </div>

                    <div class="bg-white border border-gray-100 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all relative">
                        <span class="absolute top-5 right-5 text-[11px] font-semibold text-gray-400 uppercase">Featured</span>
                        <div class="w-14 h-14 bg-gray-900 rounded-xl mb-5 flex items-center justify-center">
                            <span class="text-white text-xs">Instabug</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 leading-snug">Digital Marketing Specialist</h3>
                        <p class="text-green-600 text-sm font-medium mb-5">Instabug</p>
                        <div class="space-y-3.5 text-base text-gray-600">
                            <div class="flex items-center gap-2.5"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg> Cairo, Egypt</div>
                            <div class="flex items-center gap-2.5"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> Part-time (Remote)</div>
                            <div class="flex items-center gap-2.5 font-semibold text-gray-800"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> 3,500 EGP / month</div>
                        </div>
                        <button class="w-full mt-7 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-3 px-4 rounded-xl transition-colors text-lg">View Details</button>
                    </div>

                    <div class="bg-white border border-gray-100 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all relative">
                        <span class="absolute top-5 right-5 text-[11px] font-semibold text-gray-400 uppercase">Featured</span>
                        <div class="w-14 h-14 bg-purple-100 rounded-xl mb-5 flex items-center justify-center">
                            <span class="text-purple-600 text-xs">Voda</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 leading-snug">Product Design Trainee</h3>
                        <p class="text-green-600 text-sm font-medium mb-5">Vodafone Egypt</p>
                        <div class="space-y-3.5 text-base text-gray-600">
                            <div class="flex items-center gap-2.5"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg> Giza, Egypt</div>
                            <div class="flex items-center gap-2.5"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> Full-time (On-site)</div>
                            <div class="flex items-center gap-2.5 font-semibold text-gray-800"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> Paid (Unspecified)</div>
                        </div>
                        <button class="w-full mt-7 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-3 px-4 rounded-xl transition-colors text-lg">View Details</button>
                    </div>

                    <div class="bg-white border border-gray-100 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all relative">
                        <span class="absolute top-5 right-5 text-[11px] font-semibold text-gray-400 uppercase">Featured</span>
                        <div class="w-14 h-14 bg-green-100 rounded-xl mb-5 flex items-center justify-center">
                            <span class="text-green-700 text-xs">Trella</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 leading-snug">HR Operations Associate</h3>
                        <p class="text-green-600 text-sm font-medium mb-5">Trella</p>
                        <div class="space-y-3.5 text-base text-gray-600">
                            <div class="flex items-center gap-2.5"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg> Cairo, Egypt</div>
                            <div class="flex items-center gap-2.5"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> Full-time</div>
                            <div class="flex items-center gap-2.5 font-semibold text-gray-800"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> 5,000 EGP / month</div>
                        </div>
                        <button class="w-full mt-7 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-3 px-4 rounded-xl transition-colors text-lg">View Details</button>
                    </div>

                    <div class="bg-white border border-indigo-200 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all relative ring-2 ring-indigo-50">
                        <span class="absolute top-5 right-5 text-[11px] font-semibold text-indigo-400 uppercase">Featured</span>
                        <div class="w-14 h-14 bg-red-950 rounded-xl mb-5 flex items-center justify-center">
                            <span class="text-white text-xs">Fawry</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 leading-snug">Data Analyst Intern</h3>
                        <p class="text-green-600 text-sm font-medium mb-5">Fawry</p>
                        <div class="space-y-3.5 text-base text-gray-600">
                            <div class="flex items-center gap-2.5"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg> Cairo, Egypt</div>
                            <div class="flex items-center gap-2.5"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> Full-time (Hybrid)</div>
                            <div class="flex items-center gap-2.5 font-semibold text-gray-800"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> 4,500 EGP / month</div>
                        </div>
                        <button class="w-full mt-7 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-3 px-4 rounded-xl transition-colors text-lg">View Details</button>
                    </div>

                    <div class="bg-white border border-gray-100 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all relative">
                        <span class="absolute top-5 right-5 text-[11px] font-semibold text-gray-400 uppercase">Featured</span>
                        <div class="w-14 h-14 bg-blue-100 rounded-xl mb-5 flex items-center justify-center">
                            <span class="text-blue-700 text-xs">Vezeeta</span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 leading-snug">Mobile Dev (iOS/Android)</h3>
                        <p class="text-green-600 text-sm font-medium mb-5">Vezeeta</p>
                        <div class="space-y-3.5 text-base text-gray-600">
                            <div class="flex items-center gap-2.5"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg> New Cairo, Egypt</div>
                            <div class="flex items-center gap-2.5"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> Full-time (Remote)</div>
                            <div class="flex items-center gap-2.5 font-semibold text-gray-800"><svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg> 6,000 EGP / month</div>
                        </div>
                        <button class="w-full mt-7 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-3 px-4 rounded-xl transition-colors text-lg">View Details</button>
                    </div>

                </div>

                <div class="text-center mt-16 mb-8">
                    <button class="bg-[#0f172a] hover:bg-black text-white px-10 py-4 rounded-xl font-bold transition-all text-lg shadow-md">
                        Browse All 500+ Internships
                    </button>
                </div>

            </div>
        </section>







        <section class="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div class="max-w-7xl mx-auto">

                <div class="relative overflow-hidden bg-linear-to-br from-[#061c23] via-[#0a2a33] to-[#061c23] rounded-[40px] p-10 md:p-16 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">

                    <div class="md:w-2/3 z-10">
                        <div class="flex items-center gap-2 mb-6">
                            <svg class="w-5 h-5 text-[#2ecc71]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span class="text-[#2ecc71] font-bold text-xs uppercase tracking-widest">For Students</span>
                        </div>

                        <h2 class="text-white text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                            Ready to start your <br className="hidden md:block" /> professional journey?
                        </h2>

                        <p class="text-gray-300 text-lg md:text-xl max-w-xl leading-relaxed">
                            Join 10,000+ Egyptian students who have found their dream internships through Tadrebk. Create your profile today and get matched with the right opportunities.
                        </p>
                    </div>

                    <div class="md:w-1/3 flex flex-col items-center z-10">
                        <button class="bg-[#2ecc71] hover:bg-[#27ae60] text-[#061c23] font-black text-lg py-4 px-10 rounded-xl transition-all transform hover:scale-105 shadow-lg w-full md:w-auto whitespace-nowrap">
                            Create Student Profile
                        </button>
                        <p class="text-gray-400 text-xs mt-4 text-center">
                            Free forever for students. No strings attached.
                        </p>
                    </div>

                    <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-[#2ecc71] opacity-10 rounded-full blur-3xl"></div>
                </div>

            </div>
        </section>






//////


        <section class="py-16 bg-white border-b border-gray-100">
            <div class="max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div class="flex flex-col items-center">
                        <span class="text-3xl md:text-4xl font-black text-gray-900 mb-2">500+</span>
                        <span class="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Active Listings</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <span class="text-3xl md:text-4xl font-black text-gray-900 mb-2">200+</span>
                        <span class="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Hiring Partners</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <span class="text-3xl md:text-4xl font-black text-gray-900 mb-2">12k+</span>
                        <span class="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Student Users</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <span class="text-3xl md:text-4xl font-black text-gray-900 mb-2">85%</span>
                        <span class="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Success Rate</span>
                    </div>
                </div>
            </div>
        </section>

        <footer class="bg-white pt-20 pb-10">
            <div class="max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">

                    <div class="lg:col-span-2">
                        <h2 class="text-[#2ecc71] text-2xl font-black mb-6">Tadrebk</h2>
                        <p class="text-gray-500 text-sm leading-relaxed max-w-xs mb-8">
                            Connecting Egypt's brightest university students with the future of work.
                        </p>
                        <div class="flex gap-4 text-green-500">
                            <a href="#" class="hover:opacity-80 transition-opacity">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </a>
                            <a href="#" class="hover:opacity-80 transition-opacity">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.599 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-gray-900 font-bold mb-6 text-sm">For Students</h4>
                        <ul class="space-y-4 text-gray-500 text-sm">
                            <li><a href="#" class="hover:text-[#2ecc71] transition-colors">Browse Internships</a></li>
                            <li><a href="#" class="hover:text-[#2ecc71] transition-colors">Student Dashboard</a></li>
                            <li><a href="#" class="hover:text-[#2ecc71] transition-colors">Career Advice</a></li>
                            <li><a href="#" class="hover:text-[#2ecc71] transition-colors">CV Builder</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-gray-900 font-bold mb-6 text-sm">For Companies</h4>
                        <ul class="space-y-4 text-gray-500 text-sm">
                            <li><a href="#" class="hover:text-[#2ecc71] transition-colors">Post an Internship</a></li>
                            <li><a href="#" class="hover:text-[#2ecc71] transition-colors">Talent Solutions</a></li>
                            <li><a href="#" class="hover:text-[#2ecc71] transition-colors">Success Stories</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 class="text-gray-900 font-bold mb-6 text-sm">Support</h4>
                        <ul class="space-y-4 text-gray-500 text-sm">
                            <li><a href="#" class="hover:text-[#2ecc71] transition-colors">Help Center</a></li>
                            <li><a href="#" class="hover:text-[#2ecc71] transition-colors">Contact Us</a></li>
                            <li><a href="#" class="hover:text-[#2ecc71] transition-colors">Privacy Policy</a></li>
                            <li><a href="#" class="hover:text-[#2ecc71] transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div class="pt-8 border-t border-gray-100 text-center">
                    <p class="text-gray-400 text-[11px] font-medium uppercase tracking-widest">
                        © 2026 Tadrebk. All rights reserved. Built for students in Egypt.
                    </p>
                </div>
            </div>
        </footer>




    </>
}