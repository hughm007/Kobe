#!/usr/bin/env python3
"""Static web QA battery (BC-45 static parts, BC-46 strings, BC-49 SEO). Stdlib only.

usage: servicepow_web_qc.py --site <dir|http(s)://host> [--facts facts.json] [--max-pages 50]
Exit 0 = all executed checks pass; 1 = failures (each printed as FAIL lines).
Rendered checks (overflow/axe/console) are NOT here - use the Playwright battery.
"""
import argparse, json, os, re, sys, urllib.request, urllib.parse
from html.parser import HTMLParser
from pathlib import Path

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.titles=[]; self.metas={}; self.h1=0; self.links=[]; self.forms=[]
        self.imgs=[]; self.canonical=None; self._in_title=False; self.viewport=False
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=="title": self._in_title=True; self.titles.append("")
        if tag=="meta":
            n=(a.get("name") or a.get("property") or "").lower()
            if n: self.metas[n]=a.get("content","")
            if n=="viewport": self.viewport=True
        if tag=="link" and a.get("rel","").lower()=="canonical": self.canonical=a.get("href")
        if tag=="h1": self.h1+=1
        if tag=="a" and a.get("href"): self.links.append(a["href"])
        if tag=="form": self.forms.append(a.get("action",""))
        if tag=="img": self.imgs.append(a.get("alt"))
    def handle_endtag(self, tag):
        if tag=="title": self._in_title=False
    def handle_data(self, d):
        if self._in_title and self.titles: self.titles[-1]+=d

def fetch(site, path):
    if site.startswith("http"):
        url=urllib.parse.urljoin(site.rstrip("/")+"/", path.lstrip("/"))
        try:
            with urllib.request.urlopen(url, timeout=10) as r: return r.status, r.read().decode("utf-8","replace")
        except Exception as e:
            code=getattr(e,"code",0); return code or 0, ""
    p=Path(site)/path.lstrip("/")
    if p.is_dir(): p=p/"index.html"
    if not p.suffix: 
        cand=p.with_suffix(".html"); p = cand if cand.exists() else p/"index.html"
    return (200, p.read_text("utf-8","replace")) if p.exists() else (404,"")

def discover(site):
    if site.startswith("http"): return ["/"]
    root=Path(site); out=[]
    for p in root.rglob("*.html"):
        out.append("/"+str(p.relative_to(root)))
    return sorted(out) or ["/"]

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--site",required=True)
    ap.add_argument("--facts"); ap.add_argument("--max-pages",type=int,default=50)
    a=ap.parse_args()
    fails=[]; ok=[]
    def gate(name,cond,detail):
        (ok if cond else fails).append(f"{'PASS' if cond else 'FAIL'}  {name}: {detail}")
    pages=discover(a.site)[:a.max_pages]
    seen_titles={}; all_text=""
    internal=set()
    parsed={}
    for path in list(pages):
        code,html=fetch(a.site,path)
        if code!=200: fails.append(f"FAIL  page:{path}: HTTP {code}"); continue
        pg=Page(); pg.feed(html); parsed[path]=pg; all_text+=html
        for h in pg.links:
            if h.startswith(("http://","https://","#","mailto:","tel:","javascript:")): continue
            internal.add(h.split("#")[0].split("?")[0])
        # crawl for URL mode
        if a.site.startswith("http"):
            for h in list(internal):
                if h and h not in pages and len(pages)<a.max_pages and h.startswith("/"):
                    pages.append(h)
    for path,pg in parsed.items():
        t=(pg.titles[0].strip() if pg.titles else "")
        gate(f"seo:title:{path}", bool(t), t[:60] or "MISSING")
        if t: seen_titles.setdefault(t,[]).append(path)
        gate(f"seo:meta-description:{path}", bool(pg.metas.get("description","").strip()),
             "present" if pg.metas.get("description") else "MISSING")
        gate(f"seo:h1:{path}", pg.h1==1, f"{pg.h1} h1 tags (need exactly 1)")
        gate(f"seo:viewport:{path}", pg.viewport, "viewport meta" if pg.viewport else "MISSING")
        noindex="noindex" in pg.metas.get("robots","").lower()
        gate(f"seo:no-noindex:{path}", not noindex, "clean" if not noindex else "NOINDEX PRESENT")
        alts=[x for x in pg.imgs if x is None or not str(x).strip()]
        gate(f"a11y:img-alt:{path}", not alts, f"{len(alts)} images missing alt" if alts else f"{len(pg.imgs)} imgs ok")
        for f in pg.forms:
            gate(f"func:form-action:{path}", f!="" , f"action='{f}'" if f else "form with NO action")
        for h in pg.links:
            if h.startswith("tel:"):
                gate(f"func:tel:{path}", bool(re.match(r"tel:\+?[\d\-\.\(\) ]{7,}$",h)), h)
            if h.startswith("mailto:"):
                gate(f"func:mailto:{path}", "@" in h, h)
    for t,ps in seen_titles.items():
        gate("seo:title-unique", len(ps)==1, f"'{t[:40]}' on {len(ps)} pages" if len(ps)>1 else t[:40])
    # internal link resolution
    for h in sorted(internal):
        if not h or not h.startswith("/"): continue
        code,_=fetch(a.site,h)
        gate(f"func:link:{h}", code==200, f"HTTP {code}")
    # robots/sitemap (dir mode or URL mode)
    for aux in ["/robots.txt","/sitemap.xml"]:
        code,_=fetch(a.site,aux)
        gate(f"seo:{aux}", code==200, f"HTTP {code}")
    # facts (BC-46)
    if a.facts:
        facts=json.loads(Path(a.facts).read_text())
        for s_ in facts.get("must_contain",[]):
            gate(f"facts:present:'{s_[:30]}'", s_ in all_text, "found" if s_ in all_text else "ABSENT FROM SITE")
        for s_ in facts.get("must_not_contain",[]):
            low = s_.lower() in all_text.lower()
            gate(f"facts:barred:'{s_[:30]}'", not low, "clean" if not low else "BARRED TERM PRESENT")
    for line in ok: print(line)
    for line in fails: print(line)
    print(f"\nWEB-QC: {'PASS' if not fails else 'FAIL'} ({len(ok)} passed, {len(fails)} failed, {len(parsed)} pages)")
    sys.exit(1 if fails else 0)

if __name__=="__main__": main()
