import { HelpCircle, Download, Upload, Settings, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export function Help() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Documentation</h1>
        <p className="text-gray-600">Everything you need to know about building and installing WordPress plugins</p>
      </div>

      <div className="space-y-6">
        <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Getting Started</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Create Your Account</h3>
              <p className="text-gray-700">Sign up for a free account and get a 14-day trial to explore all features. No credit card required.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Build Your Plugin</h3>
              <p className="text-gray-700">Navigate to "New Plugin" and fill out the form with your requirements. Our AI will process your request and generate a custom WordPress plugin.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Download & Install</h3>
              <p className="text-gray-700">Once your plugin is ready, download it from "My Plugins" and follow the installation instructions below.</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="bg-green-50 border-b border-green-100 px-6 py-4">
            <div className="flex items-center">
              <Download className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">How to Install Your WordPress Plugin</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                Download Your Plugin
              </h3>
              <p className="text-gray-700 ml-8">
                Go to the "My Plugins" page and click the "Download" button next to your completed plugin. This will download a .zip file to your computer.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                Access WordPress Admin
              </h3>
              <p className="text-gray-700 ml-8">
                Log in to your WordPress admin panel (usually at <code className="bg-gray-100 px-2 py-1 rounded text-sm">yoursite.com/wp-admin</code>).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
                Navigate to Plugins
              </h3>
              <p className="text-gray-700 ml-8">
                In your WordPress dashboard, go to <strong>Plugins → Add New</strong>.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">4</span>
                Upload Plugin
              </h3>
              <div className="ml-8 space-y-2">
                <p className="text-gray-700">Click the <strong>"Upload Plugin"</strong> button at the top of the page.</p>
                <p className="text-gray-700">Click <strong>"Choose File"</strong> and select the .zip file you downloaded.</p>
                <p className="text-gray-700">Click <strong>"Install Now"</strong>.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">5</span>
                Activate Plugin
              </h3>
              <p className="text-gray-700 ml-8">
                Once the installation is complete, click <strong>"Activate Plugin"</strong>. Your custom plugin is now live on your WordPress site!
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 ml-8">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">Important Note</h4>
                  <p className="text-amber-800 text-sm">
                    Make sure to backup your WordPress site before installing any new plugin. This ensures you can restore your site if any issues occur.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-4">
            <div className="flex items-center">
              <Upload className="w-6 h-6 text-amber-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Alternative Installation Method (FTP)</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-700">If you prefer to install via FTP or have issues with the WordPress uploader:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Extract the downloaded .zip file on your computer</li>
              <li>Connect to your website via FTP (using FileZilla, Cyberduck, or similar)</li>
              <li>Navigate to <code className="bg-gray-100 px-2 py-1 rounded text-sm">/wp-content/plugins/</code></li>
              <li>Upload the extracted plugin folder to this directory</li>
              <li>Go to your WordPress dashboard and navigate to <strong>Plugins → Installed Plugins</strong></li>
              <li>Find your plugin in the list and click <strong>"Activate"</strong></li>
            </ol>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
            <div className="flex items-center">
              <Settings className="w-6 h-6 text-slate-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Plugin Configuration</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-700">
              After activating your plugin, you may need to configure its settings. Most plugins will add a menu item in your WordPress admin sidebar. Look for your plugin name or check under:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Settings</strong> - For general configuration options</li>
              <li><strong>Tools</strong> - For utility and maintenance features</li>
              <li>A dedicated menu item with your plugin's name</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
            <div className="flex items-center">
              <HelpCircle className="w-6 h-6 text-slate-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How long does it take to generate a plugin?</h3>
              <p className="text-gray-700">
                Most plugins are generated within 5-10 minutes. Complex plugins with advanced features may take up to 30 minutes. You'll receive a notification when your plugin is ready.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I modify the generated plugin?</h3>
              <p className="text-gray-700">
                Yes! All generated plugins include clean, well-documented code that you can customize to fit your specific needs. You own the code and can modify it as you wish.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Are the plugins compatible with the latest WordPress version?</h3>
              <p className="text-gray-700">
                Yes, all plugins are generated to be compatible with the latest version of WordPress and follow WordPress coding standards and best practices.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What if my plugin doesn't work correctly?</h3>
              <p className="text-gray-700">
                If you encounter any issues, you can submit a new request with specific details about the problem. Pro and Enterprise users get priority support for troubleshooting.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I use the test environment before installing?</h3>
              <p className="text-gray-700">
                Yes! For completed plugins, click "View Test Site" to see your plugin in action in a temporary WordPress environment before downloading and installing it on your live site.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I upgrade my subscription?</h3>
              <p className="text-gray-700">
                Go to the "Billing" page and select the plan that best fits your needs. You can upgrade or downgrade your plan at any time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Do I need coding knowledge to use this platform?</h3>
              <p className="text-gray-700">
                No! Our platform is designed for users of all skill levels. Simply describe what you want your plugin to do, and our AI will handle the technical implementation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens after my trial ends?</h3>
              <p className="text-gray-700">
                After your 14-day trial ends, you can choose to upgrade to a paid plan to continue creating plugins. Any plugins created during your trial remain yours to use forever.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I use visual reference images?</h3>
              <p className="text-gray-700">
                You can add image URLs to show how you want your plugin output to look. Upload images to any hosting service (like Imgur, Dropbox, or your own server) and paste the URLs in the "Visual Reference Images" section. Our AI will use these references to match the design and layout.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What are Divi Modules and Elementor Widgets?</h3>
              <p className="text-gray-700">
                Divi Modules and Elementor Widgets are custom components for popular page builders. Select "Divi Module" to create a custom module for the Divi Builder, or "Elementor Widget" to create a custom widget for Elementor. These will integrate seamlessly with the respective page builder interfaces.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I create both a plugin and a page builder module?</h3>
              <p className="text-gray-700">
                When you select a builder type (Divi or Elementor), the generated plugin will include both the standard plugin functionality and the page builder integration. This means you can use your features through the page builder interface while maintaining all plugin capabilities.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="bg-green-50 border-b border-green-100 px-6 py-4">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Best Practices</h2>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>Test First:</strong> Always use the test environment before installing on your live site</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>Backup:</strong> Create a full backup of your WordPress site before installing new plugins</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>Be Specific:</strong> Provide detailed descriptions to get the most accurate plugin for your needs</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>Check Compatibility:</strong> Verify theme compatibility requirements before installing</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>Keep Updated:</strong> Regularly check for plugin updates to ensure security and compatibility</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Still Need Help?</h3>
          <p className="text-gray-700 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Email: <a href="mailto:support@wppluginbuilder.com" className="text-blue-600 hover:text-blue-700 font-medium">support@wppluginbuilder.com</a></p>
            <p>Response time: Within 24 hours (Priority support for Pro & Enterprise)</p>
          </div>
        </section>
      </div>
    </div>
  );
}
