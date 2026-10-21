"""Self-host a small Google Fonts LXGW WenKai TC subset for the site's copy."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlencode
import re

project = Path(__file__).resolve().parent.parent
assets = project / "dist" / "assets"
source = "".join(file.read_text(encoding="utf-8") for file in (project / "dist").glob("*.*") if file.suffix in {".html", ".js"})
characters = "".join(sorted(set(re.findall(r"[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]", source))))
characters += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ·，。！？、：；（）—↗✧✳"
query = urlencode({"family": "LXGW WenKai TC", "display": "swap", "text": characters})
headers = {"User-Agent": "Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36"}

def fetch(url):
    with urlopen(Request(url, headers=headers), timeout=40) as response:
        return response.read()

css = fetch("https://fonts.googleapis.com/css2?" + query).decode("utf-8")
font_url = re.search(r"url\(([^)]+)\)", css).group(1)
font = fetch(font_url)
is_woff2 = font[:4] == b"wOF2"
extension = "woff2" if is_woff2 else "ttf"
filename = f"window-hand.{extension}"
(assets / filename).write_bytes(font)
(assets / "font.css").write_text(f"/* LXGW WenKai TC, SIL Open Font License 1.1. Self-hosted subset. */\n@font-face{{font-family:'Window Hand';font-style:normal;font-weight:400;font-display:swap;src:url('{filename}') format('{'woff2' if is_woff2 else 'truetype'}');}}\n", encoding="utf-8")
(assets / "FONT-LICENSE.txt").write_bytes(fetch("https://raw.githubusercontent.com/google/fonts/main/ofl/lxgwwenkaitc/OFL.txt"))
print(f"Self-hosted {filename}: {len(font):,} bytes, {len(characters)} characters, license saved.")
