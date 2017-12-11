import { AppRoutingModule } from './app-routing.module';

describe('AppRoutingModule', () => {
    let appRouterModule: AppRoutingModule;

    beforeEach(() => {
        appRouterModule = new AppRoutingModule();
    });

    it('should create an instance', () => {
        expect(appRouterModule).toBeTruthy();
    });
});
