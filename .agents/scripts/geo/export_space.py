import json, time, urllib.request

URL = "https://api-testnet.geobrowser.io/graphql"
def gql(q, tries=6):
    for i in range(tries):
        req = urllib.request.Request(URL, data=json.dumps({"query": q}).encode(),
                                     headers={"Content-Type": "application/json"})
        try:
            d = json.load(urllib.request.urlopen(req, timeout=90))
        except Exception as e:
            print("  retry (transport):", str(e)[:120], flush=True); time.sleep(5); continue
        if d.get("errors"):
            print("  retry (api):", json.dumps(d["errors"])[:150], flush=True); time.sleep(5); continue
        if d.get("data") and all(v is not None for v in d["data"].values()):
            return d["data"]
        print("  retry (null data)", flush=True); time.sleep(5)
    raise RuntimeError("query failed: " + q[:120])

SPACE = "ddfd01098a71083119eb130a01a6d4c5"

ents, after = [], None
while True:
    a = f', after: "{after}"' if after else ""
    c = gql('{ entitiesConnection(spaceId: "%s", first: 100%s) { pageInfo { hasNextPage endCursor } nodes { id name description types { id name } } } }' % (SPACE, a))["entitiesConnection"]
    ents += c["nodes"]
    print("  entities ...", len(ents), flush=True)
    if not c["pageInfo"]["hasNextPage"]: break
    after = c["pageInfo"]["endCursor"]
json.dump({"spaceId": SPACE, "count": len(ents), "entities": ents}, open("entities-all.json", "w"), indent=1)
print("entities:", len(ents), flush=True)

tbs, after = [], None
while True:
    a = f', after: "{after}"' if after else ""
    d = gql('{ textBlocks: entitiesConnection(typeId: "76474f2f00894e77a0410b39fb17d0bf", spaceId: "%s", first: 100%s) { pageInfo { hasNextPage endCursor } nodes { id values(first: 10) { nodes { property { id name } text } } } } }' % (SPACE, a))["textBlocks"]
    tbs += d["nodes"]
    print("  text blocks ...", len(tbs), flush=True)
    if not d["pageInfo"]["hasNextPage"]: break
    after = d["pageInfo"]["endCursor"]
json.dump({"spaceId": SPACE, "count": len(tbs), "textBlocks": tbs}, open("text-blocks.json", "w"), indent=1)
print("text blocks:", len(tbs), flush=True)

pages, after = [], None
while True:
    a = f', after: "{after}"' if after else ""
    d = gql('{ pages: entitiesConnection(typeId: "480e3fc267f3499385fbacdf4ddeaa6b", spaceId: "%s", first: 100%s) { pageInfo { hasNextPage endCursor } nodes { id name relations(first: 100) { nodes { type { id name } toEntity { id name } position } } values(first: 20) { nodes { property { id name } text } } } } }' % (SPACE, a))["pages"]
    pages += d["nodes"]
    print("  pages ...", len(pages), flush=True)
    if not d["pageInfo"]["hasNextPage"]: break
    after = d["pageInfo"]["endCursor"]
json.dump({"spaceId": SPACE, "count": len(pages), "pages": pages}, open("pages.json", "w"), indent=1)
print("pages:", len(pages), flush=True)
print("DONE", flush=True)
