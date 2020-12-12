import time
import json
import math
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

physical_devices = tf.config.list_physical_devices('GPU') 
tf.config.experimental.set_memory_growth(physical_devices[0], True)

BUY_INDEX = 0
SELL_INDEX = 1

Model = tf.keras.models.load_model("BazaarAI")

def JsonToNumpy(Data):
    Arr = [np.array(arr) for arr in json.loads(Data)]
    return np.array(Arr)

ItemList = JsonToNumpy(open("./ItemList.json","r").read())

def GetDerivativeOfArray(Arr):
    Derivative = np.zeros(Arr.size-1)
    for i in range(Arr.size-1):
        Derivative[i] = Arr[i+1] - Arr[i]
    return Derivative

def RunPrediction(JsonData):
    Data = JsonToNumpy(JsonData)
    DataForPrediction = np.zeros((ItemList.size,2,20))

    for i in range(ItemList.size):
        ItemData = Data[i]
        Deriatives = np.array([GetDerivativeOfArray(ItemData[BUY_INDEX]),GetDerivativeOfArray(ItemData[SELL_INDEX])])
        DataForPrediction[i] = Deriatives

    Factors = np.zeros((ItemList.size,2))

    for i in range(ItemList.size):
        MaximumBuyValue = 0
        MaximumSellValue = 0
        for j in range(20):
            if (MaximumBuyValue < abs(DataForPrediction[i][BUY_INDEX][j])):
                MaximumBuyValue = abs(DataForPrediction[i][BUY_INDEX][j])
            if (MaximumSellValue < abs(DataForPrediction[i][SELL_INDEX][j])):
                MaximumSellValue = abs(DataForPrediction[i][SELL_INDEX][j])
        DataForPrediction[i][BUY_INDEX] /= MaximumBuyValue
        DataForPrediction[i][SELL_INDEX] /= MaximumSellValue
        Factors[i][BUY_INDEX] = MaximumBuyValue
        Factors[i][SELL_INDEX] = MaximumSellValue

    Prediction = Model.predict(tf.reshape(DataForPrediction,(1,ItemList.size,2,20)))
    Prediction = np.squeeze(Prediction)

    for i in range(ItemList.size):
        Prediction[i][BUY_INDEX] *= Factors[i][BUY_INDEX]
        Prediction[i][SELL_INDEX] *= Factors[i][SELL_INDEX]
    
    return Prediction

while True:
    time.sleep(0.1)
    data = input()
    if (data == "PING"):
        print("PONG")
    elif (data.startswith("INPUT_")):
        Prediction = RunPrediction(data.replace("INPUT_",""))
        print(json.dumps(Prediction.tolist()))

    