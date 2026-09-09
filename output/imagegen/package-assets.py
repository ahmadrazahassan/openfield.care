from pathlib import Path
import zipfile
root=Path.cwd()
target=root/'output'/'openfield-assets.zip'
with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
    for dirname in ['public','content','components/icons']:
        for f in sorted((root/dirname).rglob('*')):
            if f.is_file(): archive.write(f,f.relative_to(root))
    for name in ['README.md','prompts.json','asset-manifest.json','validation.json']:
        f=root/'output'/'imagegen'/name
        archive.write(f,f.relative_to(root))
    for f in (root/'output'/'imagegen'/'fonts').glob('*OFL.txt'):
        archive.write(f,f.relative_to(root))
    brief=root/'01-IMAGE-ASSET-PROMPTS.md'
    if not brief.exists(): brief=root/'docs'/'01-IMAGE-ASSET-PROMPTS.md'
    archive.write(brief,'01-IMAGE-ASSET-PROMPTS.md')
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None
    print(f'{len(archive.namelist())} files packaged; {target.stat().st_size:,} bytes; ZIP integrity verified.')
