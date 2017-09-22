from PIL import Image


image_file = Image.open("abs.jpg").convert('RGBA')# 打开图片

total = image_file.size[1] * image_file.size[0]
print(total)

for h in range(0,  image_file.size[1]):#h
    for w in range(0, image_file.size[0]):#w
        r, g, b, a = image_file.getpixel((w,h))
        # avg = (r + g + b) // 3
        avg = b
        image_file.putpixel((w, h), (avg,avg,avg,int(avg/1.5 + 100)))
image_file.save("abs.png")

region = (0, 725, 1920, 1080)
image_file = image_file.crop(region)
image_file.save("footer.png")
# mask = total * 0.4
# mask_width = 90
# print(mask, mask_width)

# count_list = [0] * 800
# for h in range(0,  image_file.size[1]):#h
#     for w in range(0, image_file.size[0]):#w
#         r, g, b, a = image_file.getpixel((w,h))
#         count_list[r+g+b] += 1


# range_sum = sum(count_list[:mask_width])
# del_list = []
# if range_sum > mask:
#     del_list.append(mask_width)

# for i in range(mask_width, 800):
#     range_sum = range_sum - count_list[i-mask_width] + count_list[i]
#     if range_sum > mask:
#         del_list.append(i)

# if not del_list:
#     max_num = 800
#     min_num = 800
# else:
#     max_num = max(del_list) + mask_width + 1
#     min_num = min(del_list) - mask_width - 1

# for h in range(0,  image_file.size[1]):#h
#     for w in range(0, image_file.size[0]):#w
#         r, g, b, a = image_file.getpixel((w,h))
#         if min_num < r+g+b < max_num:
#             image_file.putpixel((w, h), (0,0,0,0))

# image_file.save("test.png")

