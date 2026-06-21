import { Link } from 'react-router-dom'
import { SITE_NAME } from '../config/site'

export default function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl text-brand-bright mb-2">Privacy Policy</h1>
      <p className="text-brand-muted text-xs mb-8">Last updated: June 19, 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-brand-muted">
        <section>
          <h2 className="text-lg font-bold text-brand-bright mb-3">Introduction</h2>
          <p>
            Welcome to <strong className="text-brand-text">{SITE_NAME}</strong> (the "Website").
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and
            protect your information when you visit and use our Website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-bright mb-3">Information We Collect</h2>
          <p className="mb-3">
            This Website is designed to be privacy-friendly. We do not require you to create an
            account or provide any personal information to use our tools.
          </p>
          <h3 className="text-base font-bold text-brand-text mb-2">Local Storage Data</h3>
          <p className="mb-3">
            The channel lists you create are stored exclusively in your browser's local storage on
            your device. This data never leaves your device and is not transmitted to any server.
            Exporting your data downloads a file locally; importing reads a file you choose.
            Clearing your browser's site data removes everything.
          </p>
          <h3 className="text-base font-bold text-brand-text mb-2">
            Automatically Collected Information
          </h3>
          <p>
            When you visit the Website, certain information may be collected automatically through
            cookies and similar technologies, including your IP address, browser type, operating
            system, referring URLs, and information about how you interact with the Website. This
            information is collected by third-party services as described below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-bright mb-3">Embedded Content</h2>
          <p>
            When you choose to preview a stream or open a channel, content is loaded directly from
            YouTube or Twitch. Those services may set their own cookies and collect data according to
            their own privacy policies, which are outside the control of {SITE_NAME}.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-bright mb-3">Cookies</h2>
          <p>
            Cookies are small text files placed on your device by websites you visit. They are widely
            used to make websites work more efficiently and to provide information to site owners.
            This Website uses first-party cookies for essential functionality and third-party cookies
            for advertising and analytics purposes. You can control cookie settings through your
            browser. Please note that disabling cookies may affect your experience on the Website.
          </p>
        </section>

        <section className="bg-brand-panel border border-brand-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-brand-bright mb-3">
            Mediavine Programmatic Advertising (Ver 1.1)
          </h2>
          <p className="mb-3">
            The Website works with Mediavine to manage third-party interest-based advertising
            appearing on the Website. Mediavine serves content and advertisements when you visit the
            Website, which may use first and third-party cookies. A cookie is a small text file which
            is sent to your computer or mobile device (referred to in this policy as a "device") by
            the web server so that a website can remember some information about your browsing
            activity on the Website.
          </p>
          <p className="mb-3">
            First party cookies are created by the website that you are visiting. A third-party
            cookie is frequently used in behavioral advertising and analytics and is created by a
            domain other than the website you are visiting. Third-party cookies, tags, pixels,
            beacons and other similar technologies (collectively, "Tags") may be placed on the
            Website to monitor interaction with advertising content and to target and optimize
            advertising. Each internet browser has functionality so that you can block both first and
            third-party cookies and clear your browser's cache. The "help" feature of the menu bar on
            most browsers will tell you how to stop accepting new cookies, how to receive
            notification of new cookies, how to disable existing cookies and how to clear your
            browser's cache. For more information about cookies and how to disable them, you can
            consult the information at{' '}
            <a
              href="https://www.allaboutcookies.org/manage-cookies/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-brand-bright underline hover:text-brand-green transition-colors"
            >
              All About Cookies
            </a>
            .
          </p>
          <p className="mb-3">
            Without cookies you may not be able to take full advantage of the Website content and
            features. Please note that rejecting cookies does not mean that you will no longer see
            ads when you visit our Site. In the event you opt-out, you will still see
            non-personalized advertisements on the Website.
          </p>
          <p className="mb-3">
            The Website collects the following data using a cookie when serving personalized ads:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-3 text-brand-text">
            <li>IP Address</li>
            <li>Operating System type</li>
            <li>Operating System version</li>
            <li>Device Type</li>
            <li>Language of the website</li>
            <li>Web browser type</li>
            <li>Email (in hashed form)</li>
          </ul>
          <p className="mb-3">
            Mediavine Partners (companies listed below with whom Mediavine shares data) may also use
            this data to link to other end user information the partner has independently collected to
            deliver targeted advertisements. Mediavine Partners may also separately collect data
            about end users from other sources, such as advertising IDs or pixels, and link that data
            to data collected from Mediavine publishers in order to provide interest-based advertising
            across your online experience, including devices, browsers and apps. This data includes
            usage data, cookie information, device information, information about interactions
            between users and advertisements and websites, geolocation data, traffic data, and
            information about a visitor's referral source to a particular website. Mediavine Partners
            may also create unique IDs to create audience segments, which are used to provide targeted
            advertising.
          </p>
          <p className="mb-3">
            If you would like more information about this practice and to know your choices to opt-in
            or opt-out of this data collection, please visit{' '}
            <a
              href="https://thenai.org/opt-out/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-brand-bright underline hover:text-brand-green transition-colors"
            >
              National Advertising Initiative opt out page
            </a>
            . You may also visit{' '}
            <a
              href="http://optout.aboutads.info/#/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-brand-bright underline hover:text-brand-green transition-colors"
            >
              Digital Advertising Alliance website
            </a>{' '}
            and{' '}
            <a
              href="http://optout.networkadvertising.org/#"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-brand-bright underline hover:text-brand-green transition-colors"
            >
              Network Advertising Initiative website
            </a>{' '}
            to learn more information about interest-based advertising. You may download the
            AppChoices app at{' '}
            <a
              href="https://youradchoices.com/appchoices"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-brand-bright underline hover:text-brand-green transition-colors"
            >
              Digital Advertising Alliance's AppChoices app
            </a>{' '}
            to opt out in connection with mobile apps, or use the platform controls on your mobile
            device to opt out.
          </p>
          <p>
            For specific information about Mediavine Partners, the data each collects and their data
            collection and privacy policies, please visit{' '}
            <a
              href="https://www.mediavine.com/ad-partners/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-brand-bright underline hover:text-brand-green transition-colors"
            >
              Mediavine Partners
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-bright mb-3">Third-Party Services</h2>
          <p>
            In addition to Mediavine, we may use other third-party services such as analytics
            providers to help us understand how visitors use the Website. These services may collect
            information about your use of the Website, including your IP address, browser type, and
            pages visited. These third parties may use cookies and similar technologies to collect and
            analyze this information. We encourage you to review the privacy policies of any
            third-party services that may collect data through this Website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-bright mb-3">Your Rights Under GDPR</h2>
          <p className="mb-3">
            If you are a resident of the European Economic Area (EEA), you have certain data
            protection rights under the General Data Protection Regulation (GDPR). These include:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-3 text-brand-text">
            <li>The right to access the personal data we hold about you</li>
            <li>The right to request correction of inaccurate personal data</li>
            <li>The right to request deletion of your personal data</li>
            <li>The right to object to or restrict processing of your personal data</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent at any time</li>
          </ul>
          <p>
            Since this Website stores your data locally on your device and does not collect personal
            data on our servers, most of these rights are automatically satisfied. For any data
            collected by third-party advertising or analytics partners, please refer to their
            respective privacy policies to exercise your rights.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-bright mb-3">Your Rights Under CCPA</h2>
          <p className="mb-3">
            If you are a California resident, the California Consumer Privacy Act (CCPA) provides you
            with specific rights regarding your personal information, including:
          </p>
          <ul className="list-disc list-inside space-y-1 mb-3 text-brand-text">
            <li>The right to know what personal information is collected, used, shared, or sold</li>
            <li>The right to delete personal information held by businesses</li>
            <li>The right to opt-out of the sale of personal information</li>
            <li>The right to non-discrimination for exercising your CCPA rights</li>
          </ul>
          <p>
            To opt out of interest-based advertising, please use the opt-out links provided in the
            Mediavine Programmatic Advertising section above, or contact us using the information
            below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-bright mb-3">Children's Privacy</h2>
          <p>
            This Website is not directed at children under the age of 13. We do not knowingly collect
            personal information from children under 13. If you believe that a child under 13 has
            provided personal information through this Website, please contact us so we can take
            appropriate action.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-bright mb-3">Data Security</h2>
          <p>
            We take reasonable measures to protect the information collected through the Website. Your
            channel list data is stored only in your browser's local storage and is never transmitted
            to our servers. However, no method of transmission over the internet or method of
            electronic storage is 100% secure, and we cannot guarantee absolute security of data
            collected by third-party services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-bright mb-3">
            Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this
            page with an updated "Last updated" date. We encourage you to review this Privacy Policy
            periodically for any changes. Your continued use of the Website after any modifications
            indicates your acceptance of the updated Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-bright mb-3">Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at{' '}
            <a
              href="mailto:EnigmaMachineDev@proton.me"
              className="text-brand-bright underline hover:text-brand-green transition-colors"
            >
              EnigmaMachineDev@proton.me
            </a>{' '}
            or visit our{' '}
            <Link
              to="/contact"
              className="text-brand-bright underline hover:text-brand-green transition-colors"
            >
              Contact page
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
