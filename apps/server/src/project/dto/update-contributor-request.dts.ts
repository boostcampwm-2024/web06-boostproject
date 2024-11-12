import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ContributorStatus } from '../enum/contributor-status.enum';

export class UpdateContributorRequest {
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	contributorId: number;

	@IsNotEmpty()
	@IsEnum(ContributorStatus)
	@IsIn([ContributorStatus.ACCEPTED, ContributorStatus.REJECTED], {
		message: 'Required ACCEPTED or REJECTED',
	})
	status: ContributorStatus;
}
