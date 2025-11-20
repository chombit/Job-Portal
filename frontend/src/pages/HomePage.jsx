import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="bg-white">
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Find your dream</span>
                  <span className="block text-blue-600">job today</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Thousands of jobs in the computer, engineering and technology sectors are waiting for you.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/jobs"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      Find Jobs
                    </Link>
                  </div>
                  {!isAuthenticated && (
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                      >
                        Post a Job
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
            alt="People working on laptops"
          />
        </div>
      </div>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-widest text-blue-600 font-semibold">Built for Ambitious Careers</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Navigate your next move with confidence
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-500">
              Discover companies hiring now, trending roles across industries, and insights that help you stand out.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[{
              title: 'Fast-growing Teams',
              highlight: '120+',
              description: 'Vetted startups and enterprises interviewing this week.',
              accent: 'from-indigo-500 via-blue-500 to-sky-400',
              icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h7" />
                </svg>
              )
            }, {
              title: 'Hot Roles',
              highlight: '27%',
              description: 'Increase in remote-friendly offers across product & data.',
              accent: 'from-purple-500 via-fuchsia-500 to-pink-500',
              icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l6-6 4 4 7-7" />
                </svg>
              )
            }, {
              title: 'Candidate Wins',
              highlight: '4.8/5',
              description: 'Average satisfaction from talent hired via JobPortal.',
              accent: 'from-emerald-500 via-teal-500 to-cyan-400',
              icon: (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )
            }].map((card) => (
              <div key={card.title} className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${card.accent}`} />
                <div className="relative p-8">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br text-white shadow ${card.accent}">
                    {card.icon}
                  </div>
                  <p className="mt-6 text-sm font-medium uppercase tracking-wide text-gray-600">{card.title}</p>
                  <p className="mt-2 text-4xl font-extrabold text-gray-900">{card.highlight}</p>
                  <p className="mt-3 text-gray-500">{card.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            <div className="p-8 rounded-2xl bg-white shadow-md border border-gray-100">
              <p className="text-sm font-semibold text-blue-600">Career Playbook</p>
              <h3 className="mt-3 text-2xl font-bold text-gray-900">Three moves to land offers faster</h3>
              <ul className="mt-6 space-y-4">
                {[{
                  title: 'Show up where hiring happens',
                  desc: 'Personalized job alerts surface matching roles minutes after they go live.'
                }, {
                  title: 'Stand out with insights',
                  desc: 'Company intel, salary benchmarks, and culture notes prepared for every listing.'
                }, {
                  title: 'Track momentum in one place',
                  desc: 'Save roles, manage applications, and schedule interviews without leaving JobPortal.'
                }].map((step, idx) => (
                  <li key={step.title} className="flex">
                    <div className="flex-shrink-0">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold">
                        0{idx + 1}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-semibold text-gray-900">{step.title}</p>
                      <p className="text-sm text-gray-500">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
              <p className="text-sm uppercase tracking-widest text-blue-100">What candidates say</p>
              <blockquote className="mt-6">
                <p className="text-2xl font-semibold leading-relaxed">
                  “I discovered roles I didn’t even know existed and had three interviews scheduled within days.”
                </p>
                <footer className="mt-6">
                  <p className="font-semibold">Nora Mendez</p>
                  <p className="text-sm text-blue-100">Product Designer @ Aurora Labs</p>
                </footer>
              </blockquote>
              <div className="mt-8 grid grid-cols-2 gap-6 text-left">
                <div>
                  <p className="text-3xl font-bold">48 hrs</p>
                  <p className="text-sm text-blue-100">Average time to first recruiter response</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">87%</p>
                  <p className="text-sm text-blue-100">Applicants interviewed through JobPortal</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">Ready to explore handpicked roles?</p>
              <p className="text-sm text-gray-500">Browse curated opportunities or create alerts tailored to you.</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/jobs"
                className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse openings
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-5 py-3 border border-blue-200 text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
              >
                Create alerts
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;