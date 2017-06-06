import asyncio

async def hello():
    print("start to say hello")
    await asyncio.sleep(2)
    print("end to say hello")
    return 1

async def process():
    task = []
    for i in range(10):
        task.append(hello())
    return await asyncio.wait(task)

loop = asyncio.get_event_loop()
#loop.run_until_complete(asyncio.wait([hello(), hello()]))
done, pending = loop.run_until_complete(process())
print(next(iter(done)).result())
for doneTask in done:
    print(doneTask.result())
done, pending = loop.run_until_complete(process())
print(next(iter(done)).result())
for doneTask in done:
    print(doneTask.result())
loop.close()
