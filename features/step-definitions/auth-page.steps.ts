import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Then } from '@cucumber/cucumber';
import {
  filterAtlanticTownCities,
  isCanonicalAtlanticTownCity,
  topAtlanticTownCitySearchResult,
} from '../../src/domain/atlanticTownCities';
import { loginPageContract, registerPageContract } from '../../src/domain/authPages';

Then(
  /^the register form requires name, email, company website, Town\/City, and founder affirmation$/,
  function () {
    assert.deepEqual(registerPageContract.requiredFieldLabels, [
      'Name',
      'Email address',
      'Company website',
      'Town/City',
      'Founder affirmation',
    ]);
  },
);

Then('the register form does not ask for company name', function () {
  assert.ok(registerPageContract.hiddenFieldLabels.includes('Company name'));
});

Then('the register form does not ask for public directory consent', function () {
  assert.ok(registerPageContract.hiddenFieldLabels.includes('Public directory consent'));
});

Then('the founder affirmation copy is {string}', function (copy: string) {
  assert.equal(registerPageContract.founderAffirmationLabel, copy);
});

Then(
  /^the Town\/City dropdown for "([^"]+)" includes "([^"]+)"$/,
  function (query: string, expectedTownCity: string) {
    assert.ok(filterAtlanticTownCities(query).map(String).includes(expectedTownCity));
  },
);

Then(
  /^the Town\/City search Enter key for "([^"]+)" selects "([^"]+)"$/,
  function (query: string, expectedTownCity: string) {
    assert.equal(topAtlanticTownCitySearchResult(query), expectedTownCity);
  },
);

Then(/^"([^"]+)" is not accepted as a final Town\/City value$/, function (value: string) {
  assert.equal(isCanonicalAtlanticTownCity(value), false);
});

Then('auth text inputs preserve typed casing', function () {
  assert.equal(loginPageContract.preserveTypedInputCase, true);

  const css = readFileSync('src/design/design-system.css', 'utf8');
  const inputRule = /\.ff-input\s*\{[^}]*\}/.exec(css)?.[0] ?? '';
  assert.ok(!/text-transform\s*:\s*uppercase/i.test(inputRule));
});

Then('the invalid login notice is {string}', function (copy: string) {
  assert.equal(loginPageContract.invalidCredentialsNotice, copy);
});
