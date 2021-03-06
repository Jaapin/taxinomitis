// local dependencies
import * as store from '../db/store';
import * as visrec from './visualrecognition';
import * as conv from './conversation';
import { ClassifierSummary, BluemixServiceType, BluemixCredentials } from './training-types';




export async function getUnknownTextClassifiers(classid: string): Promise<ClassifierSummary[]>
{
    const unknownTextClassifiers: ClassifierSummary[] = [];

    // get all of the Bluemix credentials in the class
    const credentialsPool = await store.getBluemixCredentials(classid, 'conv');
    // for each API key...
    for (const credentials of credentialsPool) {
        // get all of the classifiers according to Bluemix / Watson
        const bluemixClassifiers = await conv.getTextClassifiers(credentials);

        // for each Bluemix classifier...
        for (const bluemixClassifier of bluemixClassifiers) {
            // check if it is in the DB
            //  (unless it's in the list of classifiers we know won't be in the DB)
            if (!IGNORE.includes(bluemixClassifier.name)) {
                const classifierInfo = await store.getClassifierByBluemixId(bluemixClassifier.id);
                if (!classifierInfo) {
                    unknownTextClassifiers.push(bluemixClassifier);
                }
            }
        }
    }

    return unknownTextClassifiers;
}



export async function getUnknownImageClassifiers(classid: string): Promise<ClassifierSummary[]>
{
    const unknownImageClassifiers: ClassifierSummary[] = [];

    // get all of the Bluemix credentials in the class
    const credentialsPool = await store.getBluemixCredentials(classid, 'visrec');
    // for each API key...
    for (const credentials of credentialsPool) {
        // get all of the classifiers according to Bluemix / Watson
        const bluemixClassifiers = await visrec.getImageClassifiers(credentials);

        // for each Bluemix classifier...
        for (const bluemixClassifier of bluemixClassifiers) {
            // check if it is in the DB
            const classifierInfo = await store.getClassifierByBluemixId(bluemixClassifier.id);
            if (!classifierInfo) {
                unknownImageClassifiers.push(bluemixClassifier);
            }
        }
    }

    return unknownImageClassifiers;
}




export function deleteClassifier(
    type: BluemixServiceType,
    credentials: BluemixCredentials,
    classifierid: string,
): Promise<void>
{
    if (type === 'conv') {
        return conv.deleteClassifierFromBluemix(credentials, classifierid);
    }
    else if (type === 'visrec') {
        return visrec.deleteClassifierFromBluemix(credentials, classifierid);
    }
    else {
        return Promise.resolve();
    }
}



/**
 * Names of classifiers that are automatically created by Bluemix services,
 *  and so likely to be found in accounts - not indicative of problems.
 */
export const IGNORE: string[] = [
    'Car Dashboard - Sample',
    'Customer Service - Sample',
];
