import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 to-purple-700 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 opacity-10">
            <svg width="800" height="800" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ffffff" d="M11,-19.3C14.9,-17.7,19,-15.9,21.7,-12.7C24.4,-9.5,25.7,-4.7,26.3,0.3C26.9,5.4,26.8,10.8,24.8,15.2C22.8,19.6,18.8,23,14.2,25.8C9.6,28.7,4.8,31,-0.2,31.3C-5.2,31.6,-10.5,29.9,-14.8,26.9C-19.2,23.9,-22.7,19.6,-25.4,14.9C-28.1,10.2,-30,5.1,-30.8,-0.5C-31.6,-6,-31.3,-12.1,-28.2,-16C-25.1,-19.9,-19.2,-21.7,-14,-22.3C-8.8,-22.9,-4.4,-22.3,-0.3,-21.8C3.8,-21.3,7.1,-20.9,11,-19.3Z" transform="translate(50 50)" />
            </svg>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-white mb-6">
              <span className="block text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">AI-Powered Support</span>
              <span className="block text-3xl md:text-4xl font-medium text-purple-200 mt-2">For Your Internal Teams</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8 opacity-90">
              Revolutionize your internal support with our AI-first helpdesk portal. 
              Automate ticket routing, get AI-powered response suggestions, and detect patterns 
              to proactively solve issues before they escalate.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="px-6 py-3 bg-white text-indigo-700 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 font-medium flex items-center justify-center">
                Get Started
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link to="/demo" className="px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-indigo-700 transition-all duration-200 font-medium flex items-center justify-center">
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold tracking-wider uppercase text-sm">POWERFUL CAPABILITIES</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">AI-Powered Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our AI-first approach transforms how your teams handle internal support requests,
              making the process faster, smarter, and more efficient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Auto-Routing Engine</h3>
              <p className="text-gray-600 mb-4">
                Our AI automatically analyzes and routes tickets to the right department,
                reducing response times and ensuring issues are handled by the right team.
              </p>
              <Link to="/features/auto-routing" className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center group">
                Learn more
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Response Suggestions</h3>
              <p className="text-gray-600 mb-4">
                AI-powered response suggestions help your support team respond faster and more
                accurately, with context-aware answers based on your knowledge base.
              </p>
              <Link to="/features/response-suggestions" className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center group">
                Learn more
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Pattern Detection</h3>
              <p className="text-gray-600 mb-4">
                Our AI identifies patterns in support tickets to help you proactively address
                recurring issues before they impact more users.
              </p>
              <Link to="/features/pattern-detection" className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center group">
                Learn more
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold tracking-wider uppercase text-sm">TESTIMONIALS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              See how companies like yours are transforming their internal support with our AI helpdesk.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="inline-block">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                "The AI-powered ticket routing has reduced our response times by 45%. Our employees
                are getting help faster than ever, and our support team is more efficient."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-lg mr-4">JD</div>
                <div>
                  <h4 className="font-bold text-gray-800">Jane Doe</h4>
                  <p className="text-sm text-gray-600">IT Director, Global Tech Inc.</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="inline-block">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                "The pattern detection feature identified a recurring issue that was affecting 30% of our staff.
                We fixed it once and eliminated hundreds of potential future tickets."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium text-lg mr-4">MS</div>
                <div>
                  <h4 className="font-bold text-gray-800">Michael Smith</h4>
                  <p className="text-sm text-gray-600">CTO, Innovative Solutions</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="inline-block">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Our support team loves the AI response suggestions. They're handling 3x more tickets
                with the same staff, and our internal customer satisfaction scores are at an all-time high."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium text-lg mr-4">AJ</div>
                <div>
                  <h4 className="font-bold text-gray-800">Alex Johnson</h4>
                  <p className="text-sm text-gray-600">Support Manager, Enterprise Corp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your internal support?</h2>
            <p className="text-lg text-gray-200 mb-8">
              Join the companies using AI to revolutionize their helpdesk experience.
              Start your free 14-day trial today, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="px-8 py-4 bg-white text-indigo-700 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 font-medium">
                Start Free Trial
              </Link>
              <Link to="/demo" className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-indigo-700 transition-all duration-200 font-medium">
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
