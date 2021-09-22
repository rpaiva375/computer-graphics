import numpy as np
import scipy as sp
import cv2
from google.colab.patches import cv2_imshow
from google.colab import files
from matplotlib import patheffects
import matplotlib.pyplot as plt
import json
from google.colab import files
from math import ceil
from math import floor


uploaded = files.upload()

for fn in uploaded.keys():
  graphicx_data = (cv2.cvtColor(cv2.imread(fn), cv2.COLOR_BGR2GRAY)).astype(float)
  print('User uploaded file "{name}" with length {length} bytes'.format(name=fn, length=len(uploaded[fn])))

uploaded = files.upload()

for fn in uploaded.keys():
  f = open(fn, )
  graphicx_mod = json.load(f)
  print('User uploaded file "{name}" with length {length} bytes'.format(name=fn, length=len(uploaded[fn])))


class ImageProcesser:
  ''' 
    Apply kernel and affine xform to raster images.

    Args:
        img (np.array): grayscale image in matrix form
        gmod (dict): dictionary containing kernel and affine xform information
    '''

  def __init__(self, img, gmod):
    self._image = np.copy(img)
    self._width = img.shape[1]
    self._height = img.shape[0]
    self._kernel = gmod.get("kernel")
    self._bhandler = gmod.get("bhandler")
    self._xform = np.array(gmod.get("xform"))

  def interpolacao(self, x, y, point):
    point[point[0,:].argsort()]
    (x1, y1, q11), (_x1, y2, q12), (x2, _y1, q21), (_x2, _y2, q22) = point

    return (q11 * (x2 - x) * (y2 - y) +
            q21 * (x - x1) * (y2 - y) +
            q12 * (x2 - x) * (y - y1) +
            q22 * (x - x1) * (y - y1)) / ((x2 - x1) * (y2 - y1) + 0.0)

  def inverse_mapping(self):
    matriz_inversa = np.linalg.inv(self._xform)
    p1 = np.array([0, 0, 1])
    p2 = np.array([self._height-1, 0, 1])
    p3 = np.array([0, self._width-1, 1])
    p4 = np.array([self._height-1, self._width-1, 1])
    q1 = p1 @ self._xform
    q2 = p2 @ self._xform
    q3 = p3 @ self._xform
    q4 = p4 @ self._xform

    _x = ceil(q4[0])-floor(q1[0])
    _y = ceil(q4[1])-floor(q1[1])

    new_matriz = np.zeros((_x, _y))

    for i in range(_x):
      for j in range(_y):
        pos_original = matriz_inversa @ np.array([i, j, 1])
        x = pos_original[0]
        y = pos_original[1]
        if floor(x) >= 0 and floor(x+1) < self._height and floor(y) >= 0 and ceil(y+1) < self._width:
          point = np.array([[floor(x), floor(y), self._image[floor(x),floor(y)]],
                            [floor(x), ceil(y), self._image[floor(x),ceil(y)]],
                            [ceil(x), floor(y), self._image[ceil(x),floor(y)]],
                            [ceil(x), ceil(y), self._image[ceil(x),ceil(y)]]])
          new_matriz[i,j] = self.interpolacao(x, y, point)

    return new_matriz

  def convolution(self, kernel):
    arraylist = []
    for y in range(3):
        temparray = self._image
        temparray = np.roll(temparray, y - 1, axis=0)
        for x in range(3):
            temparray_X = np.copy(temparray)
            temparray_X = np.roll(temparray_X, x - 1, axis=1)*kernel[y,x]
            arraylist.append(temparray_X)

    arraylist = np.array(arraylist)
    arraylist_sum = np.sum(arraylist, axis=0)
              
    return arraylist_sum 

  def apply_kernel(self, border):

    if self._kernel == "box":
      kernel = np.array([[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]])
      img_array = self.convolution(kernel)
    
    if self._kernel == "laplace":
      kernel = np.array([[0,-1 / 4, 0], [-1 / 4, 4 / 4, -1 / 4], [0 ,-1 / 4, 0]])
      img_array = self.convolution(kernel)

    if self._kernel == "sobel":
      kernel1 = np.array([[-1 / 8, 0 , 1 / 8],
                    [-2 / 8, 0 , 2 / 8],
                    [-1 / 8, 0 , 1 / 8]])
      kernel2 = np.array([[1 / 8  ,2 / 8  ,1 / 8 ],
                    [0      ,0      ,0     ],
                    [-1 / 8 ,-2 / 8 ,-1 / 8]])
      img_array1 = self.convolution(kernel1)
      img_array2 = self.convolution(kernel2)

      img_array = np.sqrt(img_array1**2 + img_array2**2)
    

    if border == "icrop":
      slice_val = 1
      img_array = img_array[slice_val:-slice_val, slice_val:-slice_val]


    self._image = img_array

  def apply_xform(self):
    #Imcompleto !!!
    img_array_xform = self.inverse_mapping()

    self._image = img_array_xform


  def save_image(self):
    cv2.imwrite('output.png', self._image)


  def show_image(self):
    cv2_imshow(self._image)


  def update(self, show_results = True):
    ''' Method to process image and present results    
    '''

    if (self._kernel is not None):
      self.apply_kernel(self._bhandler)

    if (self._xform is not None):
      self.apply_xform()
    
    if (show_results):
      self.show_image()
    

imgprocesser.update()

imgprocesser.save_image()