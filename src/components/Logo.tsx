import React from 'react'

/**
 * The shop's wordmark, inline (plan §12a: replace the placeholder wordmark in
 * header AND footer).
 *
 * Drawn inline rather than served as the supplied `logo.jpg` for three reasons
 * that all bite in this build:
 *
 *  - the JPG is a square with a baked-in white background, which reads as a
 *    white box on the ink footer;
 *  - inline paths take a fill from CSS, so the same asset serves the light
 *    header and the dark footer without a second export;
 *  - it costs no request, so nothing here depends on `img-src` or the image
 *    optimiser (plan §5.1).
 *
 * The geometry is the traced outline already in `src/app/icon.svg` (the
 * favicon), re-split into colour groups: the mark and the wordmark carry the
 * brand red, the wedge inside the "3" and the two outer rules carry ink.
 *
 * The viewBox crops the traced 1254-square down to the artwork, which otherwise
 * floats in a lot of empty space. It is NOT eyeballed: the artwork spans
 * x 183.0 to 1076.0 and y 368.0 to 869.9 once the transform below is applied,
 * measured off the path data itself, plus 6 units of margin. Guessing it first
 * clipped the right edge and the bottom of "COMPUTERS". If the paths are ever
 * re-traced, re-measure rather than nudging these numbers.
 *
 * Decorative by default: callers own the accessible name, because the header
 * wraps it in a link to "/" that needs its own label and the footer needs a
 * heading, and a nested `<title>` would double both up.
 */
export type LogoTone = 'brand' | 'light'

export const Logo = ({ className, tone = 'brand' }: { className?: string; tone?: LogoTone }) => {
  // On ink the red loses too much contrast to carry the whole wordmark, so the
  // dark surface takes an all-white lockup rather than a two-colour one.
  const markFill = tone === 'light' ? 'fill-white' : 'fill-red'
  const accentFill = tone === 'light' ? 'fill-white' : 'fill-ink'

  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="177 362 905 514"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="none" transform="translate(0,1254) scale(0.1,-0.1)">
        <g className={markFill}>
          {/* "3" */}
          <path d="M2679 8783 c-35 -42 -87 -105 -116 -141 -29 -35 -67 -81 -85 -101 -18 -20 -49 -57 -68 -81 -19 -24 -82 -100 -140 -169 -58 -70 -118 -143 -134 -163 l-28 -38 1541 0 1542 0 47 -24 c80 -42 122 -124 122 -237 0 -120 -66 -231 -155 -260 -32 -11 -223 -14 -915 -17 l-875 -3 -55 -68 c-30 -37 -111 -134 -180 -216 -216 -256 -330 -396 -330 -406 0 -5 461 -10 1113 -11 l1112 -3 56 -28 c117 -57 180 -165 181 -308 1 -168 -72 -280 -216 -333 -22 -8 -403 -12 -1306 -16 l-1275 -5 -297 -355 c-163 -195 -297 -358 -298 -362 0 -12 2738 -10 2799 2 44 8 59 17 100 62 149 165 285 314 290 318 3 3 46 50 96 105 49 55 115 127 146 160 31 33 109 119 174 190 65 72 163 179 219 240 56 60 121 132 146 160 25 27 75 82 111 120 98 103 129 141 129 156 0 61 -231 285 -333 325 -26 10 -21 18 34 53 121 79 243 234 306 389 55 132 76 262 69 417 -3 72 -12 157 -19 190 -62 275 -247 461 -512 516 -85 18 -164 19 -1511 19 l-1421 0 -64 -77z" />
          {/* "M" */}
          <path d="M6460 7125 l0 -1695 380 0 380 0 0 1070 c0 589 3 1070 8 1070 4 -1 72 -84 152 -186 80 -102 163 -209 186 -237 22 -29 76 -98 120 -153 43 -56 108 -139 144 -184 36 -46 99 -127 140 -180 92 -120 455 -585 486 -622 l23 -28 97 128 c155 201 572 740 629 812 28 36 78 99 111 141 323 412 400 508 407 509 4 0 7 -481 7 -1070 l0 -1070 385 0 385 0 0 1695 0 1695 -372 0 -373 -1 -61 -82 c-34 -45 -155 -208 -269 -362 -115 -154 -290 -390 -391 -525 -100 -135 -259 -348 -353 -475 -94 -126 -179 -240 -189 -253 -19 -25 32 -88 -429 532 -78 105 -305 410 -505 678 l-363 487 -367 1 -368 0 0 -1695z" />
          {/* Centre rule, the one accent between the two ink rules */}
          <path d="M5460 4869 c0 -6 5 -19 10 -30 10 -19 30 -19 790 -19 l780 0 0 30 0 30 -790 0 c-552 0 -790 -3 -790 -11z" />
          {/* C O M P U T E R S */}
          <path d="M1920 4354 c-67 -29 -70 -38 -70 -244 0 -269 -11 -260 330 -260 l230 0 0 35 0 35 -215 0 c-274 0 -255 -14 -255 183 0 203 -21 187 251 187 l219 0 0 40 0 40 -227 0 c-180 -1 -235 -4 -263 -16z" />
          <path d="M2927 4355 c-73 -26 -80 -50 -75 -277 2 -128 6 -169 18 -183 33 -39 70 -45 300 -45 319 0 310 -8 310 258 0 267 6 262 -315 262 -143 -1 -211 -5 -238 -15z m447 -87 c22 -31 23 -294 2 -324 -13 -18 -28 -19 -211 -19 -163 0 -197 2 -205 15 -15 23 -13 323 2 338 9 9 68 12 204 12 188 0 193 -1 208 -22z" />
          <path d="M3935 4357 c-3 -7 -4 -123 -3 -257 l3 -245 45 0 45 0 5 175 5 175 118 -177 118 -178 43 0 42 0 113 170 c62 93 117 172 122 175 5 4 9 -65 9 -169 l0 -176 44 0 44 0 3 215 c3 118 3 235 1 260 l-4 45 -49 0 -48 0 -122 -182 c-67 -101 -130 -194 -140 -206 l-18 -24 -136 206 -135 206 -50 0 c-32 0 -52 -5 -55 -13z" />
          <path d="M5150 4110 l0 -260 45 0 44 0 3 98 3 97 200 5 c226 6 244 11 265 76 20 58 8 169 -20 199 -37 39 -79 45 -317 45 l-223 0 0 -260z m458 168 c19 -19 15 -123 -5 -139 -12 -11 -57 -14 -187 -14 l-171 0 -3 83 -3 82 179 0 c125 0 182 -4 190 -12z" />
          <path d="M6150 4148 c0 -191 2 -227 16 -247 32 -45 68 -51 296 -51 316 0 308 -8 303 300 -1 107 -3 201 -4 208 -1 7 -17 12 -46 12 l-45 0 0 -209 c0 -182 -2 -210 -17 -222 -20 -18 -334 -26 -375 -10 l-28 10 -2 213 -3 213 -47 3 -48 3 0 -223z" />
          <path d="M7190 4330 l0 -40 125 0 125 0 0 -220 0 -220 45 0 45 0 2 218 3 217 128 3 127 3 0 39 0 40 -300 0 -300 0 0 -40z" />
          <path d="M8210 4110 l0 -260 258 2 257 3 3 33 3 32 -210 0 -209 0 -4 76 c-2 42 -1 78 1 80 2 2 91 4 198 4 l193 0 0 35 0 35 -197 2 -198 3 0 65 0 65 208 3 c225 3 226 3 213 57 l-6 25 -255 0 -255 0 0 -260z" />
          <path d="M9168 4298 c-2 -40 -2 -157 0 -260 l5 -188 43 0 43 0 3 108 3 107 70 3 c108 5 124 -1 180 -70 28 -34 68 -81 90 -105 39 -43 42 -44 93 -41 l52 3 -56 65 c-31 36 -69 80 -85 98 -16 19 -29 38 -29 43 0 5 21 9 48 9 79 1 112 42 112 142 0 77 -12 110 -49 135 -23 16 -57 18 -272 21 l-247 3 -4 -73z m460 -20 c7 -7 12 -36 12 -65 0 -41 -4 -54 -19 -63 -12 -6 -92 -10 -190 -10 l-171 0 0 75 0 75 178 0 c125 0 182 -4 190 -12z" />
          <path d="M10250 4360 c-19 -5 -45 -20 -57 -35 -20 -22 -23 -38 -23 -101 0 -136 15 -144 278 -144 133 0 192 -4 200 -12 7 -7 12 -37 12 -68 0 -79 -3 -80 -269 -80 l-218 0 1 -32 1 -33 245 -3 c217 -2 249 0 280 15 46 24 60 54 60 133 0 73 -12 104 -53 134 -26 19 -43 21 -223 23 -134 1 -200 5 -210 14 -17 14 -18 79 -1 102 10 15 40 17 237 19 l225 3 0 35 0 35 -225 2 c-124 0 -241 -3 -260 -7z" />
        </g>

        <g className={accentFill}>
          {/* Wedge inside the "3" */}
          <path d="M6098 6698 c-154 -166 -361 -391 -599 -654 -35 -39 -170 -187 -299 -328 -129 -142 -239 -264 -243 -272 -7 -12 89 -14 633 -14 l640 0 0 695 c0 382 -4 695 -9 695 -4 0 -60 -55 -123 -122z" />
          {/* Outer rules, left and right of the centre accent */}
          <path d="M1836 4883 c-3 -3 -6 -19 -6 -35 l0 -28 1694 0 c1278 0 1697 3 1702 12 4 6 -4 21 -20 35 l-27 23 -1668 0 c-917 0 -1671 -3 -1675 -7z" />
          <path d="M7287 4883 c-15 -14 -6 -33 23 -48 26 -13 226 -15 1740 -15 1521 0 1710 2 1710 15 0 8 -15 24 -32 35 -33 20 -56 20 -1734 20 -935 0 -1704 -3 -1707 -7z" />
        </g>
      </g>
    </svg>
  )
}
