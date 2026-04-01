from PIL import Image

img = Image.open('1.png')
img = img.convert('RGBA')
datas = img.getdata()

newData = []
for item in datas:
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        newData.append((0, 0, 0, 0))
    else:
        newData.append(item)

img.putdata(newData)
img.save('1.png')
print('Done! Background is now transparent.')
