# Bppb

A Discord bot that represents an integration of a Tensorflow model , [this one](https://github.com/BananaFructa/BazaarPredictionModel) , which predicts Hypixel Skyblock Bazaar prices. 

Note! A trained model is not provided

It also contains a small script for fetching Bazaar data from the [Hypixel API](https://api.hypixel.net/) which has to be manually run (Located at [Data/Collector.js](https://github.com/BananaFructa/Bppb/blob/main/Data/Collector.js)) which takes a samle every 2 hours.

To make a full prediction the model needs a minimum of 63 data points in every category (buy and sell prices) otherwise it will throw an exception.

Requires Python 3.8.6 or above, Tensorflow 2.0 or above and Numpy
