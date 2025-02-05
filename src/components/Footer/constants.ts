import { defineMessage } from "@lingui/macro";
import "./Footer.css";
import twitterIcon from "img/ic_twitter.svg";
import discordIcon from "img/ic_discord.svg";
import telegramIcon from "img/ic_telegram.svg";
import githubIcon from "img/ic_github.svg";
import mediumIcon from "img/ic_medium.svg";
import { MessageDescriptor } from "@lingui/core";

type Link = {
  text: MessageDescriptor;
  link: string;
  external?: boolean;
  isAppLink?: boolean;
};

type SocialLink = {
  link: string;
  name: string;
  icon: string;
};

export const FOOTER_LINKS: { home: Link[]; app: Link[] } = {
  home: [
    { text: defineMessage({ message: "Terms and Conditions" }), link: "/terms-and-conditions" },
    { text: defineMessage({ message: "Referral Terms" }), link: "/referral-terms" },
    { text: defineMessage({ message: "Media Kit" }), link: "https://gmxio.gitbook.io/gmx/media-kit", external: true },
    // { text: "Jobs", link: "/jobs", isAppLink: true },
  ],
  app: [
//     { text: defineMessage({ message: "Media Kit" }), link: "https://gmxio.gitbook.io/gmx/media-kit", external: true },
    // { text: "Jobs", link: "/jobs" },
  ],
};

export function getFooterLinks(isHome) {
  return FOOTER_LINKS[isHome ? "home" : "app"];
}

export const SOCIAL_LINKS: SocialLink[] = [
  { link: "https://twitter.com/ZKMX_zksync", name: "Twitter", icon: twitterIcon },
  { link: "https://t.me/zkMX_dex", name: "Telegram", icon: telegramIcon },

];
