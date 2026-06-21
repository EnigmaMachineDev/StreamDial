import { SITE_NAME } from '../config/site'

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4 text-sm text-brand-muted">
      <h1 className="text-2xl text-brand-bright">About {SITE_NAME}</h1>
      <p>
        {SITE_NAME} is a small, free tool for people who keep a rotation of livestream channels —
        lofi radios, music DJs, art and coding streams — and want a fast way to pick one and watch.
      </p>
      <p>
        It runs entirely in your browser. There is no server, no account, and no API key. When you
        paste a YouTube or Twitch URL, the channel details are parsed locally; the only network
        requests the page makes are the preview iframes you choose to load and the links you open.
      </p>
      <p>
        Your lists are saved in your browser’s local storage and never leave your device unless you
        export them yourself. Clear your browser data and they’re gone — so use the Data screen to
        keep a backup.
      </p>
      <p>
        YouTube and Twitch are trademarks of their respective owners. {SITE_NAME} is an independent
        tool and is not affiliated with or endorsed by them.
      </p>
    </div>
  )
}
