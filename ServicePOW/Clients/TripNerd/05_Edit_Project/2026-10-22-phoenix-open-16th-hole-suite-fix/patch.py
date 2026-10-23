import cv2, numpy as np
ZONE = (430, 860, 662, 903)        # ref coords: from the gap before "LOGE" to past "Suite", line 1 band
DEST = (430, 548)                  # ref x-range that "Suite" occupies after the move
SHIFT = 120.0                      # ref px: "Suite" moves left by this (start 556 -> 436, same word gap)
rng = np.random.default_rng(3)

def patch(frame, H):
    H = np.asarray(H, np.float64); Hi = np.linalg.inv(H)
    x0, y0, x1, y1 = ZONE
    poly = cv2.perspectiveTransform(np.float32([[[x0, y0]], [[x1, y0]], [[x1, y1]], [[x0, y1]]]), H).reshape(-1, 2)
    hgt, wid = frame.shape[:2]
    bx0 = int(max(0, np.floor(poly[:, 0].min()) - 3)); bx1 = int(min(wid, np.ceil(poly[:, 0].max()) + 3))
    by0 = int(max(0, np.floor(poly[:, 1].min()) - 3)); by1 = int(min(hgt, np.ceil(poly[:, 1].max()) + 3))
    if bx1 - bx0 < 4 or by1 - by0 < 3: return frame, None
    out = frame.copy()
    yy, xx = np.mgrid[by0:by1, bx0:bx1].astype(np.float32)
    pts = np.stack([xx.ravel(), yy.ravel()], 1).reshape(-1, 1, 2)
    rp = cv2.perspectiveTransform(pts, Hi).reshape(by1 - by0, bx1 - bx0, 2)        # frame px -> ref coords
    inzone = (rp[..., 0] >= x0) & (rp[..., 0] <= x1) & (rp[..., 1] >= y0) & (rp[..., 1] <= y1)
    if inzone.sum() < 10: return frame, None
    reg = frame[by0:by1, bx0:bx1].astype(np.float32)
    lum = reg.mean(2)
    paper = np.percentile(lum[inzone], 85); ink = np.percentile(lum[inzone], 1.5)
    if paper - ink < 60: return frame, None          # zone not showing the line (covered/blank)
    # 1) clean background: every dark (text) pixel in the region is masked, and each row is re-filled by linear interpolation
    #    between the plain pixels of that same row; follows the paper, the checked-row highlight band and any light falloff.
    sc = np.sqrt(abs(np.linalg.det(H[:2, :2])))
    k = max(1, int(round(2.5*sc)))
    tall = (lum < paper - 0.05*(paper - ink)).astype(np.uint8)
    tall = cv2.dilate(tall, np.ones((2*k+1, 2*k+1), np.uint8))
    tall = tall | (lum > paper + 0.04*(paper - ink)).astype(np.uint8)       # compression halo (brighter than paper) is not an anchor
    tm = (tall > 0) & inzone
    if (inzone & (tall == 0)).sum() < 10: return frame, None
    fill = reg.copy(); xs = np.arange(reg.shape[1])
    res_sd = []
    for r in range(reg.shape[0]):
        anc = tall[r] == 0
        if anc.sum() < 2: continue
        ax = xs[anc]
        for c in range(3):
            v = reg[r, anc, c]
            if len(v) >= 9: v = np.convolve(np.pad(v, 4, mode='edge'), np.ones(9)/9, mode='valid')
            fill[r, :, c] = np.interp(xs, ax, v)
        res_sd.append(reg[r, anc].std(0))
    sd = np.median(np.array(res_sd), 0) if res_sd else np.zeros(3)
    fill = cv2.GaussianBlur(fill, (1, 5), 1.0) if fill.shape[0] >= 5 else fill   # rows agree with their neighbours: no streaks
    fill = fill + rng.normal(0, 1, reg.shape[:2])[..., None] * np.minimum(sd, 2.0)[None, None, :] * 0.5
    tmf = cv2.GaussianBlur(tm.astype(np.float32), (3, 3), 0.7)[..., None]
    clean = reg*(1 - tmf) + fill*tmf
    # 2) "Suite" glyphs from this same frame, sampled SHIFT ref-px to the right of each destination pixel
    src_ref = rp.copy(); src_ref[..., 0] += SHIFT
    sp = cv2.perspectiveTransform(src_ref.reshape(-1, 1, 2), H).reshape(rp.shape)
    srcimg = cv2.remap(frame, sp[..., 0], sp[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    valid = (sp[..., 0] >= 0) & (sp[..., 0] < wid - 1) & (sp[..., 1] >= 0) & (sp[..., 1] < hgt - 1)
    dest = inzone & (rp[..., 0] >= DEST[0]) & (rp[..., 0] <= DEST[1]) & valid
    # letter opacity measured against each source pixel's own clean background (no floor bias -> no box behind the word)
    bgsrc = cv2.remap(fill.astype(np.float32), (sp[..., 0] - bx0).astype(np.float32), (sp[..., 1] - by0).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    bl = bgsrc.mean(2)
    a = np.clip((bl - srcimg.mean(2)) / np.maximum(bl - ink, 20), 0, 1)
    a = np.where(a < 0.04, 0, a) * dest
    inkc = reg[(lum < ink + 0.12*(paper - ink)) & inzone].mean(0) if ((lum < ink + 0.12*(paper - ink)) & inzone).sum() > 3 else np.array([ink]*3)
    new = clean*(1 - a[..., None]) + inkc[None, None, :]*a[..., None]
    # 3) write back only inside the zone, feathered 1 px at the zone border
    zm = cv2.GaussianBlur(inzone.astype(np.float32), (3, 3), 0.6)
    res = reg*(1 - zm[..., None]) + new*zm[..., None]
    out[by0:by1, bx0:bx1] = np.clip(res + 0.5, 0, 255).astype(np.uint8)
    return out, (bx0, by0, bx1, by1)
