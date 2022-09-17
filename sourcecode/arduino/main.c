#define __AVR_ATmega328P__ // Suppress errors in VS Code

#define FOSC 16000000UL // Clock Speed
#define BAUD 19200		// Desired BAUD
#define MYUBRR FOSC / 16 / BAUD - 1

#include <stdio.h>

#include <avr/io.h> // Contains all the I/O Register Macros
#include <avr/interrupt.h>
#include <util/delay.h> // Generates a Blocking Delay
#include "serialCom.h"
#include "i2c.h"

void USART_Init(unsigned int ubrr)
{

	UBRR0H = (unsigned char)(ubrr >> 8);
	UBRR0L = (unsigned char)ubrr;
	// Enable receiver and transmitter
	UCSR0B = (1 << RXEN0) | (1 << TXEN0);
	// Set frame format: 8data, 2stop bit
	UCSR0C = (1 << USBS0) | (3 << UCSZ00);
}

static inline void I2C_init(void)
{
	TWSR = 0;  // no prescaler
	TWBR = 72; // set clock to 100kHz
}

uint8_t address = MPU_6050;

volatile short dataReadyMPU = 0;
volatile short dataReadyUS = 0;
volatile uint16_t dataMPU;
volatile uint16_t dataUS;
long UStarget = 20000;

uint8_t data[2];

int __attribute__((OS_main)) main(void)
{
	USART_Init(MYUBRR);
	putString("\n\rDEBUG: RESET\r\n");

	I2C_init();

	// Set sleep to false, cycle to true
	I2C_poke(address, 107, 0x0); // 1 << 5);

	// set Accelerometer Range to ±2g
	I2C_poke(address,
			 28,
			 0);

	// enable Interrupts
	I2C_poke(address,
			 56,
			 1);

	// Set Sampling Rate
	I2C_poke(address,
			 25,
			 ~0);

	// set D4 as output
	DDRD |= (1 << PORTD4);
	// set D3 as input
	DDRD &= ~(1 << PORTD3);
	// set D2 as input
	DDRD &= ~(1 << PORTD2);

	// INT1 interrupt on falling edge and INT0 interrupt on rising edge
	EICRA |= 0b1011;
	// ENABLE INT0 interrupt
	EIMSK |= (1 << INT0);
	// ENABLE INT0 interrupt
	EIMSK |= (1 << INT1);
	// enable global interrupts
	SREG |= (1 << SREG_I);

	TCCR1B |= 0b010; // setup clock, use 8 prescaler
	TIMSK1 |= 1;	 // enable overflow interrupt

	uint16_t counter = 0;

	short hasSentSomething = 0;

	while (1)
	{
		if (dataReadyMPU)
		{
			putString("GyroX: ");
			// putDec(counter);
			// putChar(' ');
			I2C_read_registers(address, 67, data, 6);
			putDec((data[0] << 8) | data[1]);
			putString("\r\n");
			dataReadyMPU = 0;
			hasSentSomething = 1;
		}
		if (dataReadyUS)
		{
			putString("Ultrasound: ");
			// putDec(counter);
			// putChar(' ');
			putDec(dataUS);
			putString("\r\n");
			dataReadyUS = 0;
			hasSentSomething = 1;
		}

		if (hasSentSomething)
		{
			// Only increment Counter if it was actually used
			counter++;
			hasSentSomething = 0;
		}
	}
	return 0;
}

ISR(INT0_vect)
{
	// Read Gyro Data
	dataReadyMPU = 1;
}

ISR(INT1_vect)
{
	dataUS = TCNT1;
	dataReadyUS = 1;

	TCNT1 |= 0b11111111111111111111111111111111111110;

	// if (TCNT1 > UStarget)
	// {
	// 	// Missed target, trigger immediately
	// 	TCNT1 |= 0b11111111111111110;
	// }
	// else
	// {
	// 	TCNT1 = 0b1111111111111111 - (UStarget - TCNT1); // Get to target
	// }
}

ISR(TIMER1_OVF_vect)
{
	PORTD |= (1 << PORTD4);
	_delay_us(20);
	PORTD &= ~(1 << PORTD4);
}