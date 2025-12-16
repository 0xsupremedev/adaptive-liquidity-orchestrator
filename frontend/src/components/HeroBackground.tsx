

export function HeroBackground() {
    return (
        <div className="absolute inset-0 bg-black">
            <div className="absolute inset-0">
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 1200 800"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        <radialGradient id="neonPulse1" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                            <stop offset="30%" stopColor="rgba(251,146,60,1)" />
                            <stop offset="70%" stopColor="rgba(249,115,22,0.8)" />
                            <stop offset="100%" stopColor="rgba(249,115,22,0)" />
                        </radialGradient>
                        <radialGradient id="neonPulse2" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                            <stop offset="25%" stopColor="rgba(251,146,60,0.9)" />
                            <stop offset="60%" stopColor="rgba(234,88,12,0.7)" />
                            <stop offset="100%" stopColor="rgba(234,88,12,0)" />
                        </radialGradient>
                        <radialGradient id="neonPulse3" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                            <stop offset="35%" stopColor="rgba(251,146,60,1)" />
                            <stop offset="75%" stopColor="rgba(234,88,12,0.6)" />
                            <stop offset="100%" stopColor="rgba(234,88,12,0)" />
                        </radialGradient>
                        <radialGradient id="heroTextBg" cx="30%" cy="50%" r="70%">
                            <stop offset="0%" stopColor="rgba(249,115,22,0.15)" />
                            <stop offset="40%" stopColor="rgba(251,146,60,0.08)" />
                            <stop offset="80%" stopColor="rgba(234,88,12,0.05)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                        </radialGradient>
                        <filter id="heroTextBlur" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="12" result="blur" />
                            <feTurbulence baseFrequency="0.7" numOctaves="4" result="noise" />
                            <feColorMatrix in="noise" type="saturate" values="0" result="monoNoise" />
                            <feComponentTransfer in="monoNoise" result="alphaAdjustedNoise">
                                <feFuncA type="discrete" tableValues="0.03 0.06 0.09 0.12" />
                            </feComponentTransfer>
                            <feComposite in="blur" in2="alphaAdjustedNoise" operator="multiply" result="noisyBlur" />
                            <feMerge>
                                <feMergeNode in="noisyBlur" />
                            </feMerge>
                        </filter>
                        <linearGradient id="backgroundFade1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                            <stop offset="20%" stopColor="rgba(249,115,22,0.15)" />
                            <stop offset="80%" stopColor="rgba(249,115,22,0.15)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                        </linearGradient>
                        <linearGradient id="backgroundFade2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                            <stop offset="15%" stopColor="rgba(251,146,60,0.12)" />
                            <stop offset="85%" stopColor="rgba(251,146,60,0.12)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                        </linearGradient>
                        <linearGradient id="backgroundFade3" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                            <stop offset="25%" stopColor="rgba(234,88,12,0.18)" />
                            <stop offset="75%" stopColor="rgba(234,88,12,0.18)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                        </linearGradient>
                        <linearGradient id="threadFade1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(0,0,0,1)" />
                            <stop offset="15%" stopColor="rgba(249,115,22,0.8)" />
                            <stop offset="85%" stopColor="rgba(249,115,22,0.8)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,1)" />
                        </linearGradient>
                        <linearGradient id="threadFade2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(0,0,0,1)" />
                            <stop offset="12%" stopColor="rgba(251,146,60,0.7)" />
                            <stop offset="88%" stopColor="rgba(251,146,60,0.7)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,1)" />
                        </linearGradient>
                        <linearGradient id="threadFade3" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(0,0,0,1)" />
                            <stop offset="18%" stopColor="rgba(234,88,12,0.8)" />
                            <stop offset="82%" stopColor="rgba(234,88,12,0.8)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,1)" />
                        </linearGradient>
                        <filter id="backgroundBlur" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="8" result="blur" />
                            <feTurbulence baseFrequency="0.9" numOctaves="3" result="noise" />
                            <feColorMatrix in="noise" type="saturate" values="0" result="monoNoise" />
                            <feComponentTransfer in="monoNoise" result="alphaAdjustedNoise">
                                <feFuncA type="discrete" tableValues="0.05 0.1 0.15 0.2" />
                            </feComponentTransfer>
                            <feComposite in="blur" in2="alphaAdjustedNoise" operator="multiply" result="noisyBlur" />
                            <feMerge>
                                <feMergeNode in="noisyBlur" />
                            </feMerge>
                        </filter>
                        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <g>
                        <ellipse cx="300" cy="350" rx="400" ry="200" fill="url(#heroTextBg)" filter="url(#heroTextBlur)" opacity="0.6" />
                        <ellipse cx="350" cy="320" rx="500" ry="250" fill="url(#heroTextBg)" filter="url(#heroTextBlur)" opacity="0.4" />
                        <ellipse cx="400" cy="300" rx="600" ry="300" fill="url(#heroTextBg)" filter="url(#heroTextBlur)" opacity="0.2" />

                        <path id="thread1" d="M50 720 Q200 590 350 540 Q500 490 650 520 Q800 550 950 460 Q1100 370 1200 340" stroke="url(#threadFade1)" strokeWidth="0.8" fill="none" opacity="0.8" />
                        <circle r="2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="4s" repeatCount="indefinite"><mpath href="#thread1" /></animateMotion>
                        </circle>

                        <path id="thread2" d="M80 730 Q250 620 400 570 Q550 520 700 550 Q850 580 1000 490 Q1150 400 1300 370" stroke="url(#threadFade2)" strokeWidth="1.5" fill="none" opacity="0.7" />
                        <circle r="3" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="5s" repeatCount="indefinite"><mpath href="#thread2" /></animateMotion>
                        </circle>

                        <path id="thread3" d="M20 710 Q180 580 320 530 Q460 480 600 510 Q740 540 880 450 Q1020 360 1200 330" stroke="url(#threadFade3)" strokeWidth="1.2" fill="none" opacity="0.8" />
                        <circle r="2.5" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="4.5s" repeatCount="indefinite"><mpath href="#thread3" /></animateMotion>
                        </circle>

                        <path id="thread4" d="M120 740 Q280 640 450 590 Q620 540 770 570 Q920 600 1070 510 Q1220 420 1350 390" stroke="url(#threadFade1)" strokeWidth="0.6" fill="none" opacity="0.6" />
                        <circle r="1.5" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="5.5s" repeatCount="indefinite"><mpath href="#thread4" /></animateMotion>
                        </circle>

                        <path id="thread5" d="M60 725 Q220 600 380 550 Q540 500 680 530 Q820 560 960 470 Q1100 380 1280 350" stroke="url(#threadFade2)" strokeWidth="1.0" fill="none" opacity="0.7" />
                        <circle r="2.2" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="4.2s" repeatCount="indefinite"><mpath href="#thread5" /></animateMotion>
                        </circle>

                        <path id="thread6" d="M150 735 Q300 660 480 610 Q660 560 800 590 Q940 620 1080 530 Q1220 440 1400 410" stroke="url(#threadFade3)" strokeWidth="1.3" fill="none" opacity="0.6" />
                        <circle r="2.8" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="5.2s" repeatCount="indefinite"><mpath href="#thread6" /></animateMotion>
                        </circle>

                        <path id="thread7" d="M40 715 Q190 585 340 535 Q490 485 630 515 Q770 545 910 455 Q1050 365 1250 335" stroke="url(#threadFade1)" strokeWidth="0.9" fill="none" opacity="0.8" />
                        <circle r="2" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="4.8s" repeatCount="indefinite"><mpath href="#thread7" /></animateMotion>
                        </circle>

                        <path id="thread8" d="M100 728 Q260 630 420 580 Q580 530 720 560 Q860 590 1000 500 Q1140 410 1320 380" stroke="url(#threadFade2)" strokeWidth="1.4" fill="none" opacity="0.7" />
                        <circle r="3" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="5.8s" repeatCount="indefinite"><mpath href="#thread8" /></animateMotion>
                        </circle>

                        <path id="thread9" d="M30 722 Q170 595 310 545 Q450 495 590 525 Q730 555 870 465 Q1010 375 1180 345" stroke="url(#threadFade3)" strokeWidth="0.5" fill="none" opacity="0.6" />
                        <circle r="1.2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="6s" repeatCount="indefinite"><mpath href="#thread9" /></animateMotion>
                        </circle>

                        <path id="thread10" d="M90 732 Q240 625 390 575 Q540 525 680 555 Q820 585 960 495 Q1100 405 1300 375" stroke="url(#threadFade1)" strokeWidth="1.1" fill="none" opacity="0.8" />
                        <circle r="2.5" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="4.3s" repeatCount="indefinite"><mpath href="#thread10" /></animateMotion>
                        </circle>

                        <path id="thread11" d="M70 727 Q210 605 360 555 Q510 505 650 535 Q790 565 930 475 Q1070 385 1260 355" stroke="url(#threadFade2)" strokeWidth="0.4" fill="none" opacity="0.5" />
                        <circle r="1" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="5.7s" repeatCount="indefinite"><mpath href="#thread11" /></animateMotion>
                        </circle>

                        <path id="thread12" d="M110 738 Q270 645 430 595 Q590 545 730 575 Q870 605 1010 515 Q1150 425 1380 395" stroke="url(#threadFade3)" strokeWidth="1.5" fill="none" opacity="0.7" />
                        <circle r="3.2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="4.7s" repeatCount="indefinite"><mpath href="#thread12" /></animateMotion>
                        </circle>

                        <path id="thread13" d="M45 718 Q185 588 325 538 Q465 488 605 518 Q745 548 885 458 Q1025 368 1220 338" stroke="url(#threadFade1)" strokeWidth="0.7" fill="none" opacity="0.6" />
                        <circle r="1.8" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="5.3s" repeatCount="indefinite"><mpath href="#thread13" /></animateMotion>
                        </circle>

                        <path id="thread14" d="M130 721 Q290 630 460 580 Q630 530 770 560 Q910 590 1050 500 Q1190 410 1350 380" stroke="url(#threadFade2)" strokeWidth="1.0" fill="none" opacity="0.8" />
                        <circle r="2.3" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="4.9s" repeatCount="indefinite"><mpath href="#thread14" /></animateMotion>
                        </circle>

                        <path id="thread16" d="M85 719 Q235 605 385 555 Q535 505 675 535 Q815 565 955 475 Q1095 385 1320 355" stroke="url(#threadFade1)" strokeWidth="1.5" fill="none" opacity="0.9" />
                        <circle r="3.2" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
                            <animateMotion dur="4.1s" repeatCount="indefinite"><mpath href="#thread16" /></animateMotion>
                        </circle>
                    </g>
                </svg>
            </div>
        </div>
    );
}
