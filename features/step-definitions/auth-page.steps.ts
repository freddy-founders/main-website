import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Then } from '@cucumber/cucumber';
import {
  filterAtlanticTownCities,
  normalizeAtlanticTownCity,
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
  /^the Town\/City search for "([^"]+)" includes "([^"]+)"$/,
  function (query: string, expectedTownCity: string) {
    assert.ok(filterAtlanticTownCities(query).map(String).includes(expectedTownCity));
  },
);

Then(
  /^entering "([^"]+)" for Town\/City canonicalizes to "([^"]+)"$/,
  function (value: string, expectedTownCity: string) {
    assert.equal(normalizeAtlanticTownCity(value), expectedTownCity);
  },
);

Then('auth text inputs preserve typed casing', function () {
  assert.equal(loginPageContract.preserveTypedInputCase, true);

  const css = readFileSync('src/design/design-system.css', 'utf8');
  const inputRule = /\.ff-input\s*\{[^}]*\}/.exec(css)?.[0] ?? '';
  assert.ok(!/text-transform\s*:\s*uppercase/i.test(inputRule));
});

Then('the invalid login notice is {string}', function (copy: string) {
  assert.equal(loginPageContract.invalidCredentialsNotice, copy);
});
