import os
import pickle

from skimage.io import imread
from skimage.transform import resize
import numpy as np
from cuml.model_selection import train_test_split
from cuml.svm import SVC
from sklearn.metrics import accuracy_score

# prepare data
input_dir = 'clf-data'
categories = ['empty', 'not_empty']

data = []
labels = []

if __name__ == '__main__':
    for category_idx, category in enumerate(categories):
        for file in os.listdir(os.path.join(input_dir, category)):
            img_path = os.path.join(input_dir, category, file)
            img = imread(img_path)
            img = resize(img, (15, 15))
            data.append(img.flatten())
            labels.append(category_idx)

    data = np.asarray(data)
    labels = np.asarray(labels)

    # train / test split
    x_train, x_test, y_train, y_test = train_test_split(data, labels, test_size=0.2, shuffle=True, stratify=labels)

    # train classifier
    classifier = SVC()

    # Here we would use GridSearchCV from cuml when it becomes available
    # For now, let's assume we manually set hyperparameters
    classifier.set_params(C=10, gamma=0.001)

    classifier.fit(x_train, y_train)

    # test performance
    y_prediction = classifier.predict(x_test)

    score = accuracy_score(y_prediction, y_test)

    print('{}% of samples were correctly classified'.format(str(score * 100)))

    pickle.dump(classifier, open('./model.p', 'wb'))

