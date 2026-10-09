import time
from glograph import GloGraph

g = GloGraph()              # add token="..." if you set one in Preferences → API
g.ping()                    # sanity check; raises if the API is off

fed = g.nodes.create(title="Fed +75bps", x=100, y=120, tags=["rates"])
time.sleep(0.8)             # small pauses make the canvas reveal readable on video
cpi = g.nodes.create(title="CPI 9.1%", x=400, y=120)
time.sleep(0.8)
g.edges.create(source_id=fed["id"], target_id=cpi["id"])
