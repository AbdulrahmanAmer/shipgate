import sys,re
for i,l in enumerate(open(sys.argv[1],encoding='utf-8'),1):
    if re.match(r'^\| \d',l):
        s=l.replace('\\|','')
        n=s.count('|')
        if n!=8:
            idx=[m.start() for m in re.finditer(r'\|',s)]
            print(i,n,[s[j-20:j+20] for j in idx[7:]])
print("ok")
