<?php

declare(strict_types=1);

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

namespace TYPO3\CMS\Frontend\Tests\Functional\SiteHandling;

use TYPO3\CMS\Core\Core\Bootstrap;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\Cache\NonceValueSubstitution;
use TYPO3\TestingFramework\Core\Functional\Framework\DataHandling\Scenario\DataHandlerFactory;
use TYPO3\TestingFramework\Core\Functional\Framework\DataHandling\Scenario\DataHandlerWriter;
use TYPO3\TestingFramework\Core\Functional\Framework\Frontend\InternalRequest;

final class RequestHandlerTest extends AbstractTestCase
{
    protected array $pathsToProvideInTestInstance = [
        'typo3/sysext/frontend/Tests/Functional/Fixtures/Assets/app.css' => 'fileadmin/app.css',
        'typo3/sysext/frontend/Tests/Functional/Fixtures/Assets/app.js' => 'fileadmin/app.js',
    ];

    protected function setUp(): void
    {
        $this->configurationToUseInTestInstance['SYS']['features']['security.frontend.enforceContentSecurityPolicy'] = true;
        $this->configurationToUseInTestInstance['FE']['debug'] = true;
        parent::setUp();

        $this->withDatabaseSnapshot(function () {
            $this->importCSVDataSet(__DIR__ . '/../Fixtures/be_users.csv');
            $backendUser = $this->setUpBackendUser(1);
            Bootstrap::initializeLanguageObject();
            $scenarioFile = __DIR__ . '/Fixtures/SlugScenario.yaml';
            $factory = DataHandlerFactory::fromYamlFile($scenarioFile);
            $writer = DataHandlerWriter::withBackendUser($backendUser);
            $writer->invokeFactory($factory);
            static::failIfArrayIsNotEmpty($writer->getErrors());
            $this->setUpFrontendRootPage(
                1000,
                [
                    'EXT:frontend/Tests/Functional/SiteHandling/Fixtures/RequestHandler.typoscript',
                ],
                [
                    'title' => 'ACME Root',
                ]
            );
        });
        $this->writeSiteConfiguration(
            'website-local',
            $this->buildSiteConfiguration(1000, 'https://website.local/')
        );
    }

    protected function tearDown(): void
    {
        GeneralUtility::purgeInstances();
        parent::tearDown();
    }

    /**
     * @test whether two subsequent requests have different nonce values
     */
    public function nonceAttributesForAssetsAreUpdated(): void
    {
        $firstResponse = $this->executeFrontendSubRequest(new InternalRequest('https://website.local/welcome'));
        $firstCspHeader = $firstResponse->getHeaderLine('Content-Security-Policy');
        $dom = new \DOMDocument();
        $dom->loadHTML((string)$firstResponse->getBody());
        $xpath = new \DOMXPath($dom);
        $firstScriptNonce = $xpath->query('//script')->item(0)?->attributes->getNamedItem('nonce')?->nodeValue;
        $firstLinkNonce = $xpath->query('//link')->item(0)?->attributes->getNamedItem('nonce')?->nodeValue;

        self::assertNotEmpty($firstScriptNonce);
        self::assertSame($firstScriptNonce, $firstLinkNonce);
        self::assertStringContainsString(sprintf("'nonce-%s'", $firstScriptNonce), $firstCspHeader);
        self::assertEmpty($firstResponse->getHeaderLine('X-TYPO3-Debug-Cache'));

        $secondResponse = $this->executeFrontendSubRequest(new InternalRequest('https://website.local/welcome'));
        $secondCspHeader = $secondResponse->getHeaderLine('Content-Security-Policy');
        $dom = new \DOMDocument();
        $dom->loadHTML((string)$secondResponse->getBody());
        $xpath = new \DOMXPath($dom);
        $secondScriptNonce = $xpath->query('//script')->item(0)?->attributes->getNamedItem('nonce')?->nodeValue;
        $secondLinkNonce = $xpath->query('//link')->item(0)?->attributes->getNamedItem('nonce')?->nodeValue;

        self::assertNotEmpty($secondScriptNonce);
        self::assertSame($secondScriptNonce, $secondLinkNonce);
        self::assertNotSame($firstScriptNonce, $secondScriptNonce);
        self::assertStringContainsString(sprintf("'nonce-%s'", $secondScriptNonce), $secondCspHeader);
        // @todo `FunctionalTestCase` sets caches to `NullBackend`, thus caching cannot be asserted
        // self::assertStringStartsWith('Cached page generated', $secondResponse->getHeaderLine('X-TYPO3-Debug-Cache'));
    }

    /**
     * @test whether NonceValueSubstitution is invoked via permanent `INTincScript` instruction
     */
    public function nonceValueSubstitutionIsInvoked(): void
    {
        $nonceValueSubstitutionMock = $this->createMock(NonceValueSubstitution::class);
        $nonceValueSubstitutionMock->expects(self::once())
            ->method('substituteNonce')
            ->with(self::isType('array'))
            ->willReturnCallback(static fn (array $context) => $context['content'] ?? null);
        GeneralUtility::addInstance(NonceValueSubstitution::class, $nonceValueSubstitutionMock);
        $this->executeFrontendSubRequest(new InternalRequest('https://website.local/welcome'));
    }
}
